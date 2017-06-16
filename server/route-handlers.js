const actions = require('./actions')

module.exports = {
  listSheets,
  createSheet,
  getSheet,
  updateSheet,
  deleteSheet,
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  getRows,
  createRow,
  updateRow,
  deleteRow
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

async function getColumns (ctx) {
  const sheetName = ctx.params.sheetName
  const columns = await actions.getColumns(ctx.db, sheetName)
  ctx.body = columns
}

async function createColumn (ctx) {
  const sheetName = ctx.params.sheetName
  const payload = ctx.request.body
  const column = await actions.createColumn(ctx.db, sheetName, payload)
  ctx.body = column
}

async function updateColumn (ctx) {
  const { sheetName, columnName } = ctx.params
  const payload = ctx.request.body
  const column = await actions.updateColumn(ctx.db, sheetName, columnName, payload)
  ctx.body = column
}

async function deleteColumn (ctx) {
  const { sheetName, columnName } = ctx.params
  await actions.deleteColumn(ctx.db, sheetName, columnName)
  ctx.status = 204
}

async function getRows (ctx) {
  const sheetName = ctx.params.sheetName
  const rows = await actions.getRows(ctx.db, sheetName)
  ctx.body = rows
}

async function createRow (ctx) {
  const sheetName = ctx.params.sheetName
  const payload = ctx.request.body
  const row = await actions.createRow(ctx.db, sheetName, payload)
  ctx.body = row
}

async function updateRow (ctx) {
  const sheetName = ctx.params.sheetName
  const query = ctx.request.query
  const payload = ctx.request.body

  if (Object.keys(query).length < 1) {
    ctx.throw(400, 'Missing conditions')
    return
  }

  const row = await actions.updateRow(ctx.db, sheetName, query, payload)
  ctx.body = row
}

async function deleteRow (ctx) {
  const sheetName = ctx.params.sheetName
  const query = ctx.request.query

  if (Object.keys(query).length < 1) {
    ctx.throw(400, 'Missing conditions')
    return
  }

  await actions.deleteRow(ctx.db, sheetName, query)
  ctx.status = 204
}
