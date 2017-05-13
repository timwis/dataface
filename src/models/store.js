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
    if (sheet) emitter.emit('store:selectSheet', sheet)
  })

  emitter.on('store:getList', async function () {
    try {
      state.store.sheets = await db.getTables()
      const activeSheetName = getActiveSheet()
      if (activeSheetName) emitter.emit('store:selectSheet', activeSheetName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error fetching list of sheets' })
    }
  })

  emitter.on('store:selectSheet', async function (table) {
    try {
      const fields = await db.getSchema(table)
      const fieldsWithEditable = fields.map(addEditable)
      const firstFieldName = fields.length ? fields[0].name : ''
      const rows = await db.getRows(table, firstFieldName)
      const structuredRows = rows.map(structureRow)

      state.store.activeSheet = {
        rows: structuredRows,
        fields: fieldsWithEditable,
        name: table
      }
      emitter.emit('render')
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: `Error selecting sheet ${table}` })
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
      rows[rowIndex] = rows[rowIndex] || {}
      rows[rowIndex][fieldName] = rows[rowIndex][fieldName] || {}
      rows[rowIndex][fieldName].newValue = newValue
    }
  })

  emitter.on('store:saveRow', async function (data) {
    try {
      const { rowIndex, columnIndex } = data
      const activeSheet = state.store.activeSheet
      const field = activeSheet.fields[columnIndex].name
      const row = activeSheet.rows[rowIndex]
      const oldValue = row[field].value
      const newValue = row[field].newValue
      const updates = { [field]: newValue }
      const primaryKeys = getPrimaryKeys(activeSheet.fields)
      const conditions = destructureRow(pick(row, primaryKeys))
      const isNewRow = (Object.keys(conditions).length === 0)
      const table = activeSheet.name

      let newRow

      if (isNewRow && newValue) {
        newRow = await db.insert(table, updates)
      } else if (!isNewRow && newValue !== oldValue && newValue !== undefined) {
        newRow = await db.update(table, updates, conditions)
      } else {
        console.log('not saving', isNewRow, oldValue, newValue)
      }

      if (newRow) {
        state.store.activeSheet.rows[rowIndex] = structureRow(newRow)
        emitter.emit('render')
      }
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error saving row' })
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
      emitter.emit('ui:notify', { msg: 'Error removing row' })
    }
  })

  emitter.on('store:insertField', async function () {
    try {
      const table = state.store.activeSheet.name
      const currentFieldCount = state.store.activeSheet.fields.length
      const newFieldName = `field_${currentFieldCount + 1}`
      const newField = await db.insertField(table, newFieldName)
      const newFieldWithEditable = addEditable(newField)
      state.store.activeSheet.fields.push(newFieldWithEditable)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error adding column' })
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
      emitter.emit('ui:notify', { msg: 'Error renaming column' })
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
      emitter.emit('ui:notify', { msg: 'Error removing column' })
    }
  })

  emitter.on('store:insertSheet', async function () {
    try {
      const currentSheetCount = state.store.sheets.length
      const name = `sheet_${currentSheetCount + 1}`
      await db.insertTable(name)
      state.store.sheets.push({ name })
      state.store.activeSheet.name = name
      state.store.activeSheet.rows = []
      state.store.activeSheet.fields = await db.getSchema(name)
      emitter.emit('pushState', `/${name}`)
      emitter.emit('store:insertField') // add a sample field
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error adding sheet' })
    }
  })

  emitter.on('store:renameSheet', async function (data) {
    try {
      const { oldName, name } = data
      await db.renameTable(oldName, name)
      state.store.activeSheet.name = name
      const sheet = state.store.sheets.find((item) => item.name === oldName)
      sheet.name = name
      emitter.emit('pushState', `/${name}`)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error renaming sheet' })
    }
  })

  emitter.on('store:deleteSheet', async function (name) {
    try {
      await db.deleteTable(name)
      const sheetIndex = state.store.sheets.findIndex((item) => item.name === name)
      state.store.sheets.splice(sheetIndex, 1)

      const newMaxIndex = state.store.sheets.length - 1
      const newActiveSheetIndex = Math.min(sheetIndex, newMaxIndex)
      const newActiveSheet = state.store.sheets[newActiveSheetIndex]
      const newActiveSheetName = newActiveSheet ? newActiveSheet.name : ''
      state.store.activeSheet = {
        name: null,
        fields: null,
        rows: null
      }
      emitter.emit('pushState', `/${newActiveSheetName}`)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error removing sheet' })
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

function addEditable (field) {
  field.editable = !(field.default && field.default.startsWith('nextval'))
  return field
}

function structureRow (row) {
  return mapValues(row, (value) => ({ value }))
}

function destructureRow (row) {
  return mapValues(row, 'value')
}
