const api = require('../../api/postgrest')
const pick = require('lodash/pick')

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
      state.activeSheet.rows[rowIndex] = newRow
    }
  },
  actions: {
    async getSheetList ({ commit, dispatch }) {
      let sheets
      try {
        sheets = await api.getTables()
      } catch (err) {
        console.error(err)
      }

      commit('receiveSheetList', { sheets })
      return Promise.resolve()
    },
    async getSheet ({ commit }, { name }) {
      console.log('getting sheet', name)
      let rows, columns
      try {
        columns = await api.getSchema(name)
        const firstColumnName = (columns.length) ? columns[0].name : ''
        rows = await api.getRows(name, firstColumnName) // order by
      } catch (err) {
        console.error(err)
      }

      commit('receiveSheet', { rows, columns, name })
    },
    async saveCell ({ state, commit }, { rowIndex, columnIndex, newValue }) {
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
      }

      if (newRow) {
        commit('receiveRow', { rowIndex, newRow })
      }
    }
  }
}

function getPrimaryKeys (fields) {
  return fields.filter((field) => field.constraint === 'PRIMARY KEY')
    .map((field) => field.name)
}
