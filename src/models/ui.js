module.exports = function ui (state, emitter) {
  state.ui = {
    selectedCell: {
      rowIndex: null,
      columnIndex: null,
      editing: false,
      replaceValue: null // for when entering edit mode by typing
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
    }
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
}
