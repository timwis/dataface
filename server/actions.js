const queries = require('./queries')
const { encodeType, decodeType } = require('./type-map')

module.exports = {
  listSheets: queries.listSheets,
  getSheet: queries.getSheet,
  createSheet,
  updateSheet,
  deleteSheet: queries.deleteSheet,
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn: queries.deleteColumn,
  getRows: queries.getRows,
  createRow
}

async function createSheet (db, { name }) {
  await queries.createSheet(db, { name })
  return queries.getSheet(db, name)
}

async function updateSheet (db, sheetName, { name }) {
  const promises = []
  const finalName = name || sheetName
  if (name) {
    promises.push(queries.renameSheet(db, sheetName, name))
  }
  await Promise.all(promises)
  return queries.getSheet(db, finalName)
}

async function getColumns (db, name) {
  const columns = queries
    .getColumns(db, name)
    .map(_mergeCustomProps)
    .map(_addFriendlyType)
  return columns
}

async function createColumn (db, sheetName, { name, type = 'text' }) {
  const dbType = encodeType(type)
  return queries.createColumn(db, sheetName, { name, dbType })
}

async function getColumn (db, sheetName, columnName) {
  const columns = await getColumns(db, sheetName)
  const column = columns.find((col) => col.name === columnName)
  return column
}

async function updateColumn (db, sheetName, columnName, { name, type }) {
  const dbType = type ? encodeType(type) : undefined
  await queries.updateColumn(db, sheetName, columnName, { name, dbType })
  const finalName = name || sheetName
  return getColumn(db, sheetName, finalName)
}

async function createRow (db, sheetName, payload) {
  const rows = await queries.createRow(db, sheetName, payload)
  return rows.length ? rows[0] : null
}

function _mergeCustomProps (column) {
  Object.assign(column, column.custom)
  delete column.custom
  return column
}

function _addFriendlyType (column) {
  column.type = decodeType(column.db_type)
  return column
}
