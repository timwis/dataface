const queries = require('./queries')

module.exports = {
  listSheets: queries.listSheets,
  getSheet: queries.getSheet,
  createSheet,
  updateSheet,
  deleteSheet: queries.deleteSheet
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
