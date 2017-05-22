const html = require('choo/html')

const sheetName = require('../components/sheet-name')
const Grid = require('../components/grid')

const grid = new Grid()

module.exports = function sheet (state, emit) {
  const activeSheet = state.store.activeSheet
  const selectedCell = state.ui.selectedCell
  const isNameVisible = (activeSheet.name !== null)
  const isGridVisible = (activeSheet.columns.length > 0)

  return html`
    <div>
      ${isNameVisible ? sheetName(activeSheet.name, onChangeName) : ''}
      ${isGridVisible ? grid.render({ activeSheet, selectedCell, emit }) : ''}
    </div>
  `

  function onChangeName (oldName, newName) {
    const payload = { oldName, newName }
    emit('store:renameSheet', payload)
  }
}
