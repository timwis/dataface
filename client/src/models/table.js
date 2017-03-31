module.exports = function tableModel (state, emitter) {
  state.selectedCell = {
    rowIndex: null,
    columnIndex: null,
    editing: false
  }

  emitter.on('table:selectCell', ({ rowIndex, columnIndex, editing }) => {
    state.selectedCell = { rowIndex, columnIndex, editing }
    emitter.emit('render')
  })

  emitter.on('table:deselectCell', () => {
    state.selectedCell.editing = false
    emitter.emit('render')
  })
}
