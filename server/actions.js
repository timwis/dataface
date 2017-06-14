const queries = require('./queries')
const { decodeType } = require('./type-map')

module.exports = {
  listSheets: queries.listSheets,
  getSheet: queries.getSheet,
  createSheet,
  updateSheet,
  deleteSheet: queries.deleteSheet,
  getSheetColumns
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

async function getSheetColumns (db, name) {
  const columns = queries
    .getSheetColumns(db, name)
    .map(_mergeCustomProps)
    .map(_addFriendlyType)
  return columns
}

function _mergeCustomProps (column) {
  Object.assign(column, column.custom)
  delete column.custom
  return column
}

function _addFriendlyType (column) {
  column.friendlyType = decodeType(column.type)
  return column
}
