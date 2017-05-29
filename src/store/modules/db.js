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
    }
  }
}
