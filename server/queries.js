const assert = require('assert')

module.exports = {
  listSheets,
  getSheet,
  createSheet
}

function listSheets (db) {
  return db
    .select('tablename AS name')
    .from('pg_tables')
    .where('schemaname', 'public')
}

function getSheet (db, sheetName) {
  return listSheets(db)
    .where('tablename', sheetName)
    .then((rows) => {
      assert(rows.length > 0)
      return rows[0]
    })
}

function createSheet (db, { name }) {
  return db.schema.createTable(name, (table) => {
    table.increments('id')
  })
}
