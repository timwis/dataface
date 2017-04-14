const db = require('./clients/postgrest')

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
      state.store.activeSheet = {
        rows: await db.getRows(table, 30),
        fields: await db.getSchema(table),
        name: table
      }
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('store:update', async function (data) {
    try {
      const { rowIndex, updates } = data
      const activeSheet = state.store.activeSheet
      const table = activeSheet.name
      const id = activeSheet.rows[rowIndex].id
      const conditions = { id }
      const newRow = await db.update(table, updates, conditions)
      state.store.activeSheet.rows[rowIndex] = newRow
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
