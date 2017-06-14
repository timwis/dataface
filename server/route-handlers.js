const actions = require('./actions')

module.exports = {
  listSheets,
  createSheet,
  getSheet,
  updateSheet,
  deleteSheet,
  getSheetColumns
}

async function listSheets (ctx) {
  const sheets = await actions.listSheets(ctx.db)
  ctx.body = sheets
}

async function createSheet (ctx) {
  const payload = ctx.request.body
  const sheet = await actions.createSheet(ctx.db, payload)
  ctx.body = sheet
}

async function getSheet (ctx) {
  const sheetName = ctx.params.sheetName
  const sheet = await actions.getSheet(ctx.db, sheetName)
  ctx.body = sheet
}

async function updateSheet (ctx) {
  const sheetName = ctx.params.sheetName
  const payload = ctx.request.body
  const sheet = await actions.updateSheet(ctx.db, sheetName, payload)
  ctx.body = sheet
}

async function deleteSheet (ctx) {
  const sheetName = ctx.params.sheetName
  await actions.deleteSheet(ctx.db, sheetName)
  ctx.status = 204
}

async function getSheetColumns (ctx) {
  const sheetName = ctx.params.sheetName
  const columns = await actions.getSheetColumns(ctx.db, sheetName)
  ctx.body = columns
}
