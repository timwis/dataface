module.exports = function tableModel (state, emitter) {
  state.selectedCell = {
    rowIndex: null,
    columnIndex: null,
    editing: false
  }
  state.headerMenu = {
    x: 0,
    y: 0,
    visible: false
  }

  emitter.on('table:selectCell', ({ rowIndex, columnIndex, editing }) => {
    state.selectedCell = { rowIndex, columnIndex, editing }
    emitter.emit('render')
  })

  emitter.on('table:deselectCell', () => {
    state.selectedCell.editing = false
    emitter.emit('render')
  })

  emitter.on('table:headerMenu', ({ x, y, visible }) => {
    state.headerMenu = { x, y, visible }
    emitter.emit('render')
  })
}
