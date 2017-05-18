const html = require('choo/html')

const sheetName = require('../components/sheet-name')
const grid = require('../components/grid')

module.exports = function sheet (state, emit) {
  const activeSheet = state.store.activeSheet
  const selectedCell = state.ui.selectedCell
  const isNameVisible = (activeSheet.name !== null)
  const isGridVisible = (activeSheet.fields !== null)

  return html`
    <div>
      ${isNameVisible ? sheetName(activeSheet.name, onChangeName) : ''}
      ${isGridVisible ? grid({ activeSheet, selectedCell }) : ''}
    </div>
  `

  function onChangeName (oldName, newName) {
    const payload = { oldName, newName }
    emit('store:renameSheet', payload)
  }
}
