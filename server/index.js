const Koa = require('koa')
const Router = require('koa-router')
const KoaBody = require('koa-body')
const Ajv = require('ajv')
const knex = require('knex')

const handlers = require('./route-handlers')
const schemas = require('./schemas')

const PORT = process.env.PORT
const DB_URI = process.env.DB_URI
const app = new Koa()
const router = new Router()
const bodyParser = new KoaBody()
app.context.db = knex({ client: 'pg', connection: DB_URI, ssl: true })

router.get('/sheets', handlers.listSheets)

router.post(
  '/sheets',
  bodyParser,
  validate(schemas.sheet),
  handlers.createSheet
)

router.get('/sheets/:sheetName', handlers.getSheet)

router.patch(
  '/sheets/:sheetName',
  bodyParser,
  validate(schemas.sheet),
  handlers.updateSheet
)

app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  await next()
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT)

function validate (schema) {
  const ajv = new Ajv()
  const compiled = ajv.compile(schema)

  return async (ctx, next) => {
    const isValid = compiled(ctx.request.body)
    if (isValid) {
      await next()
    } else {
      const errorMessages = compiled.errors.map((err) => err.message).join('\n')
      ctx.throw(422, errorMessages)
    }
  }
}
