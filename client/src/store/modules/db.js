const Vue = require('vue')
const pick = require('lodash/pick')

const router = require('../../router')
const api = require('../../api')

module.exports = {
  state: {
    sheets: [],
    activeSheet: {
      columns: [],
      rows: [],
      name: null,
      keys: []
    }
  },
  mutations: {
    receiveSheetList (state, { sheets }) {
      state.sheets = sheets
    },
    receiveActiveSheet (state, { rows, columns, name }) {
      state.activeSheet.rows = rows
      state.activeSheet.columns = columns
      state.activeSheet.name = name
      state.activeSheet.keys = getPrimaryKeys(columns)
    },
    receiveSheetInsertion (state, { name }) {
      Vue.set(state.sheets, state.sheets.length, { name })
    },
    receiveSheetRename (state, { oldName, newName }) {
      state.activeSheet.name = newName
      const sheet = state.sheets.find((sheet) => sheet.name === oldName)
      sheet.name = newName
    },
    receiveSheetRemoval (state, { index }) {
      Vue.delete(state.sheets, index)
    },
    receiveRow (state, { rowIndex, newRow }) {
      Vue.set(state.activeSheet.rows, rowIndex, newRow)
    },
    receiveRowRemoval (state, rowIndex) {
      Vue.delete(state.activeSheet.rows, rowIndex)
    },
    receiveColumn (state, column) {
      state.activeSheet.columns.push(column)
    },
    receiveColumnUpdate (state, { columnIndex, newColumn }) {
      Vue.set(state.activeSheet.columns, columnIndex, newColumn)
    },
    receiveColumnRename (state, { oldValue, newValue }) {
      // state.activeSheet.columns[columnIndex].name = newValue
      const rename = createRename(oldValue, newValue)
      state.activeSheet.rows = state.activeSheet.rows.map(rename)
    },
    receiveColumnRemoval (state, columnIndex) {
      Vue.delete(state.activeSheet.columns, columnIndex)
    }
  },
  actions: {
    async getSheetList ({ commit, dispatch }) {
      let sheets
      try {
        sheets = await api.getSheets()
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to get sheets` })
        return
      }

      commit('receiveSheetList', { sheets })
      return Promise.resolve()
    },
    async getSheet ({ commit, dispatch }, { name }) {
      let rows, columns
      try {
        columns = await api.getColumns(name)
        const firstColumnName = (columns.length) ? columns[0].name : ''
        rows = await api.getRows(name, firstColumnName) // order by
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to get sheet ${name}` })
        return
      }

      commit('receiveActiveSheet', { rows, columns, name })
    },
    async saveCell ({ state, commit, dispatch }, { rowIndex, columnIndex, newValue }) {
      const sheetName = state.activeSheet.name
      const columnName = state.activeSheet.columns[columnIndex].name
      const updates = { [columnName]: newValue }
      const primaryKeys = getPrimaryKeys(state.activeSheet.columns)
      const row = state.activeSheet.rows[rowIndex]
      const conditions = pick(row, primaryKeys)
      const isNewRow = (Object.keys(conditions).length === 0)

      let newRow
      try {
        if (isNewRow && newValue) {
          console.log('create')
          newRow = await api.createRow(sheetName, updates)
        } else {
          console.log('update')
          newRow = await api.updateRow(sheetName, updates, conditions)
        }
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to save cell` })
        return
      }

      if (newRow) {
        commit('receiveRow', { rowIndex, newRow })
      }
    },
    async removeRow ({ state, commit, dispatch }, rowIndex) {
      if (rowIndex === null) return
      const sheetName = state.activeSheet.name
      const row = state.activeSheet.rows[rowIndex]
      const primaryKeys = getPrimaryKeys(state.activeSheet.columns)
      const conditions = pick(row, primaryKeys)

      try {
        await api.deleteRow(sheetName, conditions)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to remove row` })
        return
      }

      commit('receiveRowRemoval', rowIndex)
    },
    async insertColumn ({ state, commit, dispatch }) {
      const sheetName = state.activeSheet.name
      const columnNames = state.activeSheet.columns.map((col) => col.name)
      const nextInSeq = getNextInSequence(columnNames)
      const newColumnName = `column_${nextInSeq}`

      let newColumn
      try {
        newColumn = await api.createColumn(sheetName, newColumnName)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Error adding column` })
        return
      }

      commit('receiveColumn', newColumn)
      return Promise.resolve()
    },
    async renameColumn ({ state, commit, dispatch }, { columnIndex, oldValue, newValue }) {
      const sheetName = state.activeSheet.name
      const updates = { name: newValue }

      let newColumn
      try {
        newColumn = await api.updateColumn(sheetName, oldValue, updates)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to rename column ${oldValue} to ${newValue}` })
        return
      }

      commit('receiveColumnUpdate', { columnIndex, newColumn })
      commit('receiveColumnRename', { oldValue, newValue })
    },
    async setColumnType ({ state, commit, dispatch }, { columnIndex, type }) {
      const sheetName = state.activeSheet.name
      const columnName = state.activeSheet.columns[columnIndex].name
      const updates = { type }

      let newColumn
      try {
        newColumn = await api.updateColumn(sheetName, columnName, updates)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to set column ${columnName} to type ${type}` })
        return
      }

      commit('receiveColumnUpdate', { columnIndex, newColumn })
    },
    async removeColumn ({ state, commit, dispatch }, columnIndex) {
      if (columnIndex === null) return
      const sheetName = state.activeSheet.name
      const columnName = state.activeSheet.columns[columnIndex].name

      try {
        await api.deleteColumn(sheetName, columnName)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to remove column ${columnName}` })
        return
      }

      commit('receiveColumnRemoval', columnIndex)
    },
    async insertSheet ({ state, commit, dispatch }) {
      const sheetNames = state.sheets.map((sheet) => sheet.name)
      const nextInSeq = getNextInSequence(sheetNames)
      const name = `sheet_${nextInSeq}`

      try {
        await api.createSheet({ name })
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to add sheet` })
        return
      }

      commit('receiveSheetInsertion', { name })
      await dispatch('getSheet', { name })
      await dispatch('insertColumn')
      router.push(`/${name}`)
    },
    async renameSheet ({ state, commit, dispatch }, { oldName, newName }) {
      const payload = { name: newName }
      try {
        await api.updateSheet(oldName, payload)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to rename sheet` })
        return
      }

      commit('receiveSheetRename', { oldName, newName })
      router.push(`/${newName}`)
    },
    async removeSheet ({ state, commit, dispatch }, name) {
      try {
        await api.deleteSheet(name)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to remove sheet ${name}` })
        return
      }

      const index = state.sheets.findIndex((sheet) => sheet.name === name)
      commit('receiveSheetRemoval', { index })

      const newActiveSheetName = determineNextActiveSheet(state, index)
      if (newActiveSheetName) {
        router.push(`/${newActiveSheetName}`)
      } else {
        const emptyPayload = { rows: [], columns: [], name: null }
        commit('receiveActiveSheet', emptyPayload)
      }
    }
  }
}

function determineNextActiveSheet (state, sheetIndex) {
  const newMaxIndex = state.sheets.length - 1
  const newActiveSheetIndex = Math.min(sheetIndex, newMaxIndex)
  const newActiveSheet = state.sheets[newActiveSheetIndex]
  return newActiveSheet ? newActiveSheet.name : ''
}

function getPrimaryKeys (fields) {
  return fields.filter((field) => field.constraint === 'PRIMARY KEY')
    .map((field) => field.name)
}

function createRename (oldValue, newValue) {
  return function (item) {
    item[newValue] = item[oldValue]
    delete item[oldValue]
    return item
  }
}

function getNextInSequence (names) {
  const numbers = names
    .map(getTrailingNumber)
    .filter(isSequenceMember)
    .sort(sortNumeric)
  return numbers.length > 0
    ? last(numbers) + 1
    : names.length + 1
}

function getTrailingNumber (name) {
  const parts = name.split('_')
  return +last(parts)
}

function isSequenceMember (input) {
  return input > 0
}

function sortNumeric (a, b) {
  return a - b
}

function last (arr) {
  return arr[arr.length - 1]
}
