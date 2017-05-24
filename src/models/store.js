const db = require('./clients/postgrest')
const pick = require('lodash/pick')
const mapValues = require('lodash/mapValues')

module.exports = function store (state, emitter) {
  state.store = {
    sheets: [],
    activeSheet: {
      columns: [],
      rows: [],
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
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error fetching list of sheets' })
    }

    const activeSheetName = determineActiveSheet()
    if (activeSheetName) {
      emitter.emit('store:selectSheet', activeSheetName)
    }
  })

  emitter.on('store:selectSheet', async function (sheetName) {
    let rows, columns
    try {
      columns = await db.getSchema(sheetName)
      const firstColumnName = (columns.length) ? columns[0].name : ''
      rows = await getRows(sheetName, firstColumnName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: `Error selecting sheet ${sheetName}` })
    }

    state.store.activeSheet = {
      rows,
      columns,
      name: sheetName
    }
    emitter.emit('render')
  })

  emitter.on('store:saveCell', async function ({ rowIndex, columnIndex, pendingValue }) {
    const activeSheet = state.store.activeSheet
    const sheetName = activeSheet.name
    const columnName = activeSheet.columns[columnIndex].name
    const currentValue = activeSheet.rows[rowIndex][columnName].value
    const updates = { [columnName]: pendingValue }
    const conditions = getConditions(rowIndex)
    const isNewRow = (Object.keys(conditions).length === 0)

    let newRow
    try {
      if (isNewRow && pendingValue) {
        newRow = await db.insert(sheetName, updates)
      } else if (!isNewRow && pendingValue !== currentValue && pendingValue !== null) {
        newRow = await db.update(sheetName, updates, conditions)
      }
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: `Error saving cell` })
    }

    if (newRow) {
      state.store.activeSheet.rows[rowIndex] = structureRow(newRow)
      emitter.emit('render')
    }
  })

  emitter.on('store:deleteRow', async function ({ rowIndex }) {
    const sheetName = state.store.activeSheet.activeSheet.name
    const conditions = getConditions(rowIndex)

    try {
      await db.deleteRow(sheetName, conditions)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error removing row' })
      return
    }

    state.store.activeSheet.rows.splice(rowIndex, 1)
    emitter.emit('render')
  })

  emitter.on('store:insertColumn', async function () {
    const activeSheet = state.store.activeSheet
    const sheetName = activeSheet.name
    const columnNames = activeSheet.columns.map((column) => column.name)
    const nextInSeq = getNextInSequence(columnNames)
    const newColumnName = `column_${nextInSeq}`

    let newColumn
    try {
      newColumn = await db.insertColumn(sheetName, newColumnName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error adding column' })
      return
    }

    state.store.activeSheet.columns.push(newColumn)
    emitter.emit('render')
  })

  emitter.on('store:renameColumn', async function ({ columnIndex, oldName, newName }) {
    const sheetName = state.store.activeSheet.name
    const rows = state.store.activeSheet.rows

    try {
      await db.renameColumn(sheetName, oldName, newName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: `Error renaming column ${oldName} to ${newName}` })
      return
    }

    state.store.activeSheet.fields[columnIndex].name = newName
    state.store.activeSheet.rows = renameProperty(rows, oldName, newName)
    emitter.emit('render')
  })

  emitter.on('store:deleteColumn', async function ({ columnIndex }) {
    const sheetName = state.store.activeSheet.name
    const columnName = state.store.activeSheet.columns[columnIndex].name

    try {
      await db.deleteColumn(sheetName, columnName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error removing column' })
      return
    }

    state.store.activeSheet.columns.splice(columnIndex, 1)
    emitter.emit('render')
  })

  emitter.on('store:insertSheet', async function () {
    const sheetNames = state.store.sheets.map((sheet) => sheet.name)
    const nextInSeq = getNextInSequence(sheetNames)
    const name = `sheet_${nextInSeq}`

    let newColumns
    try {
      await db.insertTable(name)
      newColumns = await db.getSchema(name)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error adding sheet' })
      return
    }

    state.store.sheets.push({ name })
    state.store.activeSheet.name = name
    state.store.activeSheet.rows = []
    state.store.activeSheet.columns = newColumns
    emitter.emit('pushState', `/${name}`)
    emitter.emit('store:insertColumn') // add a sample column
  })

  emitter.on('store:renameSheet', async function ({ oldName, newName }) {
    try {
      await db.renameTable(oldName, newName)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error renaming sheet' })
      return
    }

    state.store.activeSheet.name = newName
    const sheet = state.store.sheets.find((item) => item.name === oldName)
    sheet.name = newName
    emitter.emit('pushState', `/${newName}`)
  })

  emitter.on('store:deleteSheet', async function (name) {
    try {
      await db.deleteTable(name)
    } catch (err) {
      console.error(err)
      emitter.emit('ui:notify', { msg: 'Error removing sheet' })
      return
    }

    const sheetIndex = state.store.sheets.findIndex((item) => item.name === name)
    state.store.sheets.splice(sheetIndex, 1)

    const newActiveSheetName = determineNextActiveSheet()
    state.store.activeSheet = {
      name: null,
      fields: null,
      rows: null
    }
    emitter.emit('pushState', `/${newActiveSheetName}`)
  })

  function getRows (sheetName, orderBy) {
    return db.getRows(sheetName, orderBy).then((rows) => rows.map(structureRow))
  }

  function determineActiveSheet () {
    // Use param if exists, otherwise use first table in list
    if (state.params.sheet) {
      return state.params.sheet
    } else if (state.store.sheets.length > 0) {
      return state.store.sheets[0].name
    } else {
      return ''
    }
  }

  function determineNextActiveSheet (sheetIndex) {
    const newMaxIndex = state.store.sheets.length - 1
    const newActiveSheetIndex = Math.min(sheetIndex, newMaxIndex)
    const newActiveSheet = state.store.sheets[newActiveSheetIndex]
    return newActiveSheet ? newActiveSheet.name : ''
  }

  function getConditions (rowIndex) {
    const activeSheet = state.store.activeSheet
    const row = activeSheet.rows[rowIndex]
    const primaryKeys = getPrimaryKeys(activeSheet.columns)
    const conditions = destructureRow(pick(row, primaryKeys))
    return conditions
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

function renameProperty (items, oldProp, newProp) {
  return items.map((item) => {
    item[newProp] = item[oldProp]
    delete item[oldProp]
    return item
  })
}

function getNextInSequence (names) {
  const numbers = names
    .map(getTrailingNumber)
    .filter(isSequenceMember)
    .sort()
  return numbers.length > 0 ? last(numbers) + 1 : names.length + 1
}

function getTrailingNumber (name) {
  const parts = name.split('_')
  return +last(parts)
}

function isSequenceMember (input) {
  return input > 0
}

function last (arr) {
  return arr[arr.length - 1]
}
