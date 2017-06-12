const queries = require('./queries')

module.exports = {
  listSheets,
  createSheet,
  getSheet,
  updateSheet
}

async function listSheets (ctx) {
  const sheets = await queries.listSheets(ctx.db)
  ctx.body = sheets
}

async function createSheet (ctx) {
  try {
    const payload = ctx.request.body
    await queries.createSheet(ctx.db, payload)
    const sheet = await queries.getSheet(ctx.db, payload.name)
    ctx.body = sheet
  } catch (err) {
    if (err.code === '42P07') {
      ctx.throw(409)
    } else {
      ctx.throw(500)
    }
  }
}

async function getSheet (ctx) {
  const sheetName = ctx.params.sheetName
  try {
    const sheet = await queries.getSheet(ctx.db, sheetName)
    ctx.body = sheet
  } catch (err) {
    Boom.notFound()
  }
}

async function updateSheet (ctx) {
}
