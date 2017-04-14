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
      visible: false
    }
  }

  emitter.on('ui:selectCell', (data) => {
    Object.assign(state.ui.selectedCell, data)
    emitter.emit('render')
  })

  emitter.on('ui:deselectCell', () => {
    state.ui.selectedCell.editing = false
    emitter.emit('render')
  })

  emitter.on('ui:headerMenu', ({ x, y, visible }) => {
    state.ui.headerMenu = { x, y, visible }
    emitter.emit('render')
  })
}
