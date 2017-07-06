const Koa = require('koa')
const Router = require('koa-router')
const KoaBody = require('koa-body')
const knex = require('knex')
const validate = require('koa-json-schema')
const cors = require('kcors')
const koastatic = require('koa-static')
const history = require('koa2-history-api-fallback')
const passport = require('koa-passport')
const Auth0Strategy = require('passport-auth0')
const session = require('koa-session')

const handlers = require('./route-handlers')
const schemas = require('./schemas')

const app = new Koa()
const router = new Router({ prefix: '/api' })
const bodyParser = new KoaBody()

const {
  PORT = 3000,
  DB_URL,
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_CALLBACK_URL
} = process.env
const db = knex({ client: 'pg', connection: DB_URL, ssl: true })
app.context.db = db

// list sheets
router.get('/sheets', handlers.listSheets)

// create sheet
router.post(
  '/sheets',
  bodyParser,
  validate(schemas.sheet.create),
  handlers.createSheet
)

// get sheet
router.get('/sheets/:sheetName', handlers.getSheet)

// update sheet
router.patch(
  '/sheets/:sheetName',
  bodyParser,
  validate(schemas.sheet.update),
  handlers.updateSheet
)

// delete sheet
router.delete('/sheets/:sheetName', handlers.deleteSheet)

// get columns
router.get('/sheets/:sheetName/columns', handlers.getColumns)

// create column
router.post(
  '/sheets/:sheetName/columns',
  bodyParser,
  validate(schemas.column.create),
  handlers.createColumn
)

// update column
router.patch(
  '/sheets/:sheetName/columns/:columnName',
  bodyParser,
  validate(schemas.column.update),
  handlers.updateColumn
)

// delete column
router.delete('/sheets/:sheetName/columns/:columnName', handlers.deleteColumn)

// get rows
router.get('/sheets/:sheetName/rows', handlers.getRows)

// create row
router.post(
  '/sheets/:sheetName/rows',
  bodyParser, // validation handled by db
  handlers.createRow
)

// update row
router.patch(
  '/sheets/:sheetName/rows', // filtering handled by querystrings
  bodyParser, // validation handled by db
  handlers.updateRow
)

// delete row
router.delete('/sheets/:sheetName/rows', handlers.deleteRow)

// global handler
app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  try {
    await next()
  } catch (err) {
    console.error(err)
    const statusCode = err.status || translateErrorCode(err.code)
    ctx.throw(statusCode)
  }
})

const strategy = new Auth0Strategy({
  domain: AUTH0_DOMAIN,
  clientID: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  callbackURL: AUTH0_CALLBACK_URL
}, function (accessToken, refreshToken, extraParams, profile, done) {
  console.log('in', accessToken, profile)
  done(null, profile)
})

passport.use(strategy)
passport.serializeUser(function (user, done) {
  done(null, user.displayName)
})
passport.deserializeUser(function (user, done) {
  done(null, user)
})
app.keys = ['secret here']
app.use(session({}, app))
app.use(passport.initialize())
app.use(passport.session())

const authenticate = passport.authenticate('auth0', {
  clientID: AUTH0_CLIENT_ID,
  domain: AUTH0_DOMAIN,
  redirectUri: AUTH0_CALLBACK_URL,
  audience: `https://${AUTH0_DOMAIN}/userinfo`,
  responseType: 'code',
  scope: 'openid profile'
})
router.get('/login', authenticate)

router.get('/callback', passport.authenticate('auth0'))

app.use(cors())
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
