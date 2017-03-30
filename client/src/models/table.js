module.exports = function tableModel (state, emitter) {
  state.selectedCell = {
    rowIndex: null,
    columnIndex: null
  }

  emitter.on('table:selectCell', ({ rowIndex, columnIndex }) => {
    state.selectedCell = { rowIndex, columnIndex }
    emitter.emit('render')
  })

  emitter.on('table:deselectCell', () => {
    state.selectedCell = { rowIndex: null, columnIndex: null }
    emitter.emit('render')
  })
}
