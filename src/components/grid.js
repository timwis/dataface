const html = require('html')
const css = require('sheetify')
const HyperList = require('hyperlist-component')
const partial = require('lodash/partial')
const keyboard = require('keyboardjs')

const gridRow = require('./grid-row')
const gridCellHeader = require('./grid-cell-header')
const prefix = css('./grid.css')

const hyperList = initHyperList()

module.exports = function grid ({ activeSheet, selectedCell }) {
  const { columns, rows } = activeSheet

  const gridCellHeaderWithState = partial(gridCellHeader, selectedCell)

  const gridRowState = { columns, rows, selectedCell }
  const tbody = hyperList.render(gridRowState)

  return html`
    <div class=${prefix} onload=${onLoad}>
      <table class="table is-bordered is-striped is-narrow"
        onclick=${onClickCell} ondblclick=${onDblClickCell}>
        <thead>
          <tr>
            ${columns.map(gridCellHeaderWithState)}
            <th class="extra" onclick=${onClickAddColumn}>+</th>
          </tr>
        </thead>
        ${tbody}
      </table>
    </div>
  `

  function onLoad (el) {
    // TODO: Unbind the keyboard events. But I'll have to cache them
    keyboard.bind('up', partial(navigate, 'up'))
    keyboard.bind('down', partial(navigate, 'down'))
    keyboard.bind('left', partial(navigate, 'left'))
    keyboard.bind('right', partial(navigate, 'right'))
    keyboard.bind('tab', partial(navigate, 'right'))
    keyboard.bind('shift + tab', partial(navigate, 'left'))
    keyboard.bind('shift + enter', () => {}) // differentiate from just enter
    keyboard.bind('enter', onPressEnter)
    keyboard.bind('escape', onPressEscape)
  }

  function navigate (direction, evt) {
    const isCellSelected = (selectedCell.rowIndex !== null)
    const isEditing = (selectedCell.editing === true)
    const rowCount = activeSheet.rows.length
    const columnCount = activeSheet.columns.length

    if (isCellSelected && isEditing) {
      emit('ui:navigate', { direction, rowCount, columnCount })
      evt.preventDefault()
    }
  }

  function onClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isSelected = el.classList.contains('selected')

    if (!isSelected) {
      const payload = { rowIndex, columnIndex, editing: false }
      emit('ui:selectCell', payload)
    }
  }

  function onDblClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isEditing = el.classList.contains('editing')

    if (!isEditing && isCellEditable(rowIndex, columnIndex)) {
      const payload = { rowIndex, columnIndex, editing: true }
      emit('ui:selectCell', payload)
    }
  }

  function onClickAddColumn (evt) {
    emit('store:insertField')

    const lastColumnIndex = fields.length
    const payload = {
      rowIndex: -1,
      columnIndex: lastColumnIndex,
      editing: true
    }
    emit('ui:selectCell', payload)
    evt.stopPropagation()
  }

  function isCellEditable (rowIndex, columnIndex) {
    const isHeaderSelected = (rowIndex === -1)
    const isColumnEditable = activeSheet.fields[columnIndex].editable
    return isHeaderSelected || isColumnEditable
  }
}

function initHyperList () {
  const opts = {
    height: 500,
    itemHeight: 34,
    eachItem: gridRow,
    getTotal: (state) => state.rows.length + 1 // empty row at end
  }
  return new HyperList('tbody', opts)
}

function getElIndexes (el) {
  const rowIndex = numericAttribute(el.dataset.rowIndex)
  const columnIndex = numericAttribute(el.dataset.columnIndex)
  return { rowIndex, columnIndex }
}
