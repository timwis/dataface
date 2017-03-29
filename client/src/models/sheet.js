const db = require('./clients/postgres')

module.exports = function store (state, emitter) {
  state.sheets = []
  state.activeSheet = {
    fields: null,
    rows: null
  }

  emitter.on('*', function (msg, data) {
    console.log('event', msg, data)
  })

  emitter.on('pushState', function (location) {
    const sheet = location.split('/').pop()
    emitter.emit('sheets:selectSheet', sheet)
  })

  emitter.on('sheets:getList', async function () {
    try {
      state.sheets = await db.getTables()
      const activeSheetName = getActiveSheet()
      emitter.emit('sheets:selectSheet', activeSheetName)
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  emitter.on('sheets:selectSheet', async function (table) {
    try {
      state.activeSheet.rows = await db.getRows(table, 30)
      state.activeSheet.fields = await db.getSchema(table)
      state.activeSheet.name = table
      emitter.emit('render')
    } catch (err) {
      console.error(err)
    }
  })

  function getActiveSheet () {
    // Use param if exists, otherwise use first table in list
    if (state.params.sheet) {
      return state.params.sheet
    } else if (state.sheets.length > 0) {
      return state.sheets[0].name
    } else {
      return ''
    }
  }
}
