const assert = require('assert')
const Koa = require('koa')
const knex = require('knex')
const koastatic = require('koa-static')
const history = require('koa2-history-api-fallback')
const session = require('koa-session')
const redisStore = require('koa-redis')

const router = require('./router')
const passport = require('./auth')

const { PORT = 3000, DB_URL, SESSION_KEY, REDIS_URL, NODE_ENV } = process.env
const DEBUG = (NODE_ENV !== 'production')
assert(DB_URL, 'DB_URL environment variable must be set')
assert(SESSION_KEY || DEBUG, 'SESSION_KEY environment variable must be set')

const app = new Koa()
app.context.db = knex({
  client: 'pg',
  connection: DB_URL,
  ssl: true
})

// global handler
app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  try {
    await next()
  } catch (err) {
    if (DEBUG) console.error(err)
    const statusCode = err.status || translateErrorCode(err.code)
    ctx.throw(statusCode)
  }
})

app.keys = [SESSION_KEY || '']
if (DEBUG) app.use(require('kcors')({ credentials: true }))

const sessionOpts = {}
if (REDIS_URL) sessionOpts.store = redisStore({ url: REDIS_URL })
app.use(session(sessionOpts, app))
app.use(passport.initialize())
app.use(passport.session())

app.use(router.routes())
app.use(router.allowedMethods())
app.use(history())
app.use(koastatic('./client'))

app.listen(PORT)

// Translate postgres error codes to http status codes
function translateErrorCode (code) {
  switch (code) {
    case '42P07':
    case '42701':
      return 409
    case '42P01':
    case '42703':
      return 404
    case '22P01':
    case '22P02':
    case '22P03':
    case '22P05':
      return 422
    default:
      return 500
  }
}
