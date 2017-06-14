const Koa = require('koa')
const Router = require('koa-router')
const KoaBody = require('koa-body')
const knex = require('knex')
const validate = require('koa-json-schema')

const handlers = require('./route-handlers')
const schemas = require('./schemas')

const PORT = process.env.PORT
const DB_URI = process.env.DB_URI
const app = new Koa()
const router = new Router()
const bodyParser = new KoaBody()
app.context.db = knex({ client: 'pg', connection: DB_URI, ssl: true })

// list sheets
router.get('/sheets', handlers.listSheets)

// create sheet
router.post(
  '/sheets',
  bodyParser,
  validate(schemas.sheet),
  handlers.createSheet
)

// get sheet
router.get('/sheets/:sheetName', handlers.getSheet)

// update sheet
router.patch(
  '/sheets/:sheetName',
  bodyParser,
  validate(schemas.sheet),
  handlers.updateSheet
)

// delete sheet
router.delete('/sheets/:sheetName', handlers.deleteSheet)

// get sheet columns
router.get('/sheets/:sheetName/columns', handlers.getSheetColumns)

// global handler
app.use(async (ctx, next) => {
  ctx.type = 'application/json'
  try {
    await next()
  } catch (err) {
    console.error(err)
    const statusCode = translateErrorCode(err.code)
    ctx.throw(statusCode)
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT)

// Translate postgres error codes to http status codes
function translateErrorCode (code) {
  switch (code) {
    case '42P07': return 409
    case '42P01': return 404
    default: return 500
  }
}
