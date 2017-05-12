const shortid = require('shortid')

module.exports = function ui (state, emitter) {
  state.ui = {
    selectedCell: {
      rowIndex: null,
      columnIndex: null,
      editing: false
    },
    headerMenu: {
      x: 0,
      y: 0,
      columnIndex: null,
      visible: false
    },
    rowMenu: {
      x: 0,
      y: 0,
      rowIndex: null,
      visible: false
    },
    notifications: []
  }

  emitter.on('ui:selectCell', (data) => {
    Object.assign(state.ui.selectedCell, data)
    emitter.emit('render')
  })

  emitter.on('ui:headerMenu', ({ x, y, columnIndex, visible }) => {
    state.ui.headerMenu = { x, y, columnIndex, visible }
    emitter.emit('render')
  })

  emitter.on('ui:rowMenu', ({ x, y, rowIndex, visible }) => {
    state.ui.rowMenu = { x, y, rowIndex, visible }
    emitter.emit('render')
  })

  emitter.on('ui:notify', ({ msg, type = 'danger', duration = 5000 }) => {
    const id = shortid.generate()
    state.ui.notifications.push({ msg, type, id })
    window.setTimeout(() => emitter.emit('ui:dismissNotification', id), duration)
    emitter.emit('render')
  })

  emitter.on('ui:dismissNotification', (id) => {
    const index = state.ui.notifications.findIndex((item) => item.id === id)
    if (index !== -1) {
      state.ui.notifications.splice(index, 1)
      emitter.emit('render')
    }
  })
}
