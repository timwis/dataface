const Vue = require('vue')
const pick = require('lodash/pick')

const api = require('../../api/postgrest')

module.exports = {
  state: {
    sheets: [
      { name: 'Foo' },
      { name: 'Bar' }
    ],
    activeSheet: {
      columns: [],
      rows: [],
      name: null
    }
  },
  mutations: {
    receiveSheetList (state, { sheets }) {
      state.sheets = sheets
    },
    receiveSheet (state, { rows, columns, name }) {
      state.activeSheet.rows = rows
      state.activeSheet.columns = columns
      state.activeSheet.name = name
    },
    receiveRow (state, { rowIndex, newRow }) {
      Vue.set(state.activeSheet.rows, rowIndex, newRow)
    },
    receiveColumn (state, column) {
      state.activeSheet.columns.push(column)
    },
    receiveColumnRename (state, { columnIndex, oldValue, newValue }) {
      state.activeSheet.columns[columnIndex].name = newValue
      const rename = createRename(oldValue, newValue)
      state.activeSheet.rows = state.activeSheet.rows.map(rename)
    }
  },
  actions: {
    async getSheetList ({ commit, dispatch }) {
      let sheets
      try {
        sheets = await api.getTables()
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to get sheets` })
        return
      }

      commit('receiveSheetList', { sheets })
      return Promise.resolve()
    },
    async getSheet ({ commit, dispatch }, { name }) {
      console.log('getting sheet', name)
      let rows, columns
      try {
        columns = await api.getSchema(name)
        const firstColumnName = (columns.length) ? columns[0].name : ''
        rows = await api.getRows(name, firstColumnName) // order by
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to get sheet ${name}` })
        return
      }

      commit('receiveSheet', { rows, columns, name })
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
          newRow = await api.insert(sheetName, updates)
        } else {
          newRow = await api.update(sheetName, updates, conditions)
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
    async insertColumn ({ state, commit, dispatch }) {
      const sheetName = state.activeSheet.name
      const columnNames = state.activeSheet.columns.map((col) => col.name)
      const nextInSeq = getNextInSequence(columnNames)
      const newColumnName = `column_${nextInSeq}`

      let newColumn
      try {
        newColumn = await api.insertColumn(sheetName, newColumnName)
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
      try {
        await api.renameColumn(sheetName, oldValue, newValue)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Failed to rename column ${oldValue} to ${newValue}` })
        return
      }

      commit('receiveColumnRename', { columnIndex, oldValue, newValue })
    }
  }
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
