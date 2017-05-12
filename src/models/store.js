const db = require('./clients/postgrest')
const pick = require('lodash/pick')
const mapValues = require('lodash/mapValues')

module.exports = function store (state, emitter) {
  state.store = {
    sheets: [],
    activeSheet: {
      fields: null,
      rows: null,
      name: null
    }
  }

  emitter.on('pushState', function (location) {
    const sheet = location.split('/').pop()
    emitter.emit('store:selectSheet', sheet)
  })

  emitter.on('store:getList', async function () {
    try {
      state.store.sheets = await db.getTables()
      const activeSheetName = getActiveSheet()
      emitter.emit('store:selectSheet', activeSheetName)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:selectSheet', async function (table) {
    try {
      const fields = await db.getSchema(table)
      const firstFieldName = fields.length ? fields[0].name : ''
      const rows = await db.getRows(table, firstFieldName)
      const structuredRows = rows.map(structureRow)

      state.store.activeSheet = {
        rows: structuredRows,
        fields,
        name: table
      }
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:setNewValue', function (data) {
    const { rowIndex, columnIndex, newValue } = data
    const isHeader = (rowIndex === -1)
    const { rows, fields } = state.store.activeSheet

    if (isHeader) {
      state.store.activeSheet.fields[columnIndex].newName = newValue
    } else {
      const fieldName = fields[columnIndex].name
      rows[rowIndex][fieldName] = rows[rowIndex][fieldName] || {}
      rows[rowIndex][fieldName].newValue = newValue
    }
  })

  emitter.on('store:updateRow', async function (data) {
    try {
      const { rowIndex, updates } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const row = activeSheet.rows[rowIndex]
      const primaryKeys = getPrimaryKeys(activeSheet.fields)
      const conditions = destructureRow(pick(row, primaryKeys))
      const newRow = await db.update(table, updates, conditions)
      state.store.activeSheet.rows[rowIndex] = structureRow(newRow)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:insertRow', async function (data) {
    try {
      const { rowIndex, updates } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const newRow = await db.insert(table, updates)
      state.store.activeSheet.rows[rowIndex] = structureRow(newRow)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:deleteRow', async function (data) {
    try {
      const { rowIndex } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const row = activeSheet.rows[rowIndex]
      const primaryKeys = getPrimaryKeys(activeSheet.fields)
      const conditions = destructureRow(pick(row, primaryKeys))
      await db.deleteRow(table, conditions)
      state.store.activeSheet.rows.splice(rowIndex, 1)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:insertField', async function (data) {
    try {
      const table = state.store.activeSheet.name
      const currentFieldCount = state.store.activeSheet.fields.length
      const newFieldName = `field_${currentFieldCount + 1}`
      const newField = await db.insertField(table, newFieldName)
      state.store.activeSheet.fields.push(newField)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:renameField', async function (data) {
    try {
      const { columnIndex, oldValue, value } = data
      const table = state.store.activeSheet.name
      await db.renameField(table, oldValue, value)
      state.store.activeSheet.fields[columnIndex].name = value
      state.store.activeSheet.rows.map((row) => {
        row[value] = row[oldValue]
        delete row[oldValue]
        return row
      })
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:deleteField', async function (data) {
    try {
      const columnIndex = data.columnIndex
      const table = state.store.activeSheet.name
      const fieldName = state.store.activeSheet.fields[columnIndex].name
      await db.deleteField(table, fieldName)
      state.store.activeSheet.fields.splice(columnIndex, 1)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  function getActiveSheet () {
    // Use param if exists, otherwise use first table in list
    if (state.params.sheet) {
      return state.params.sheet
    } else if (state.store.sheets.length > 0) {
      return state.store.sheets[0].name
    } else {
      return ''
    }
  }
}

function getPrimaryKeys (fields) {
  return fields.filter((field) => field.constraint === 'PRIMARY KEY')
    .map((field) => field.name)
}

function structureRow (row) {
  return mapValues(row, (value) => ({ value }))
}

function destructureRow (row) {
  return mapValues(row, 'value')
}
