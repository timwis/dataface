const assert = require('assert')

module.exports = {
  listSheets,
  getSheet,
  createSheet,
  renameSheet,
  deleteSheet,
  getSheetColumns,
  createColumn,
  updateColumn
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

function renameSheet (db, oldName, newName) {
  return db.schema.renameTable(oldName, newName)
}

function deleteSheet (db, name) {
  return db.schema.dropTable(name)
}

function getSheetColumns (db, sheetName) {
  return db.raw(`
    SELECT
        cols.column_name AS name,
        cols.data_type AS db_type,
        cols.character_maximum_length AS length,
        cols.column_default AS default,
        cols.is_nullable::boolean AS null,
        constr.constraint_type AS constraint,
        pg_catalog.col_description(cls.oid, cols.ordinal_position::int)::jsonb AS custom
    FROM
        pg_catalog.pg_class AS cls,
        information_schema.columns AS cols
    LEFT JOIN
        information_schema.key_column_usage AS keys
        ON keys.column_name = cols.column_name
        AND keys.table_catalog = cols.table_catalog
        AND keys.table_schema = cols.table_schema
        AND keys.table_name = cols.table_name
    LEFT JOIN
        information_schema.table_constraints AS constr
        ON constr.constraint_name = keys.constraint_name
    WHERE
        cols.table_schema = 'public' AND
        cols.table_name = ? AND
        cols.table_name = cls.relname;
  `, sheetName).then((response) => response.rows)
}

function createColumn (db, sheetName, { name, dbType }) {
  return db.schema.alterTable(sheetName, function (t) {
    t.specificType(name, dbType)
  })
}

function updateColumn (db, sheetName, columnName, { name, dbType }) {
  return db.schema.alterTable(sheetName, function (t) {
    if (name) t.renameColumn(columnName, name)
    if (dbType) t.specificType(columnName, dbType).alter()
  })
}
