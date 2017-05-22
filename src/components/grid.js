const html = require('choo/html')
const css = require('sheetify')
const HyperList = require('hyperlist-component')
const partial = require('lodash/partial')
const bindAll = require('lodash/bindAll')
const keyboard = require('keyboardjs')

const gridRow = require('./grid-row')
const gridCellHeader = require('./grid-cell-header')
const prefix = css('./grid.css')
const { numericAttribute } = require('../util')

module.exports = class Grid {
  constructor () {
    this.hyperList = initHyperList()
    bindAll(this, ['onLoad', 'onClickCell', 'onDblClickCell', 'onClickAddColumn', 'navigate'])
  }

  render (props) {
    this.props = props
    const { activeSheet, selectedCell } = this.props
    const { columns, rows } = activeSheet
    const gridCellHeaderWithState = partial(gridCellHeader, this.props.selectedCell)

    const rowMenu = {}
    const gridRowState = { columns, rows, selectedCell, rowMenu }
    console.log(gridRowState)
    const tbody = this.hyperList.render(gridRowState)

    return html`
      <div class=${prefix} onload=${this.onLoad}>
        <table class="table is-bordered is-striped is-narrow"
          onclick=${this.onClickCell} ondblclick=${this.onDblClickCell}>
          <thead>
            <tr>
              ${columns.map(gridCellHeaderWithState)}
              <th class="extra" onclick=${this.onClickAddColumn}>+</th>
            </tr>
          </thead>
          ${tbody}
        </table>
      </div>
    `
  }

  onLoad (el) {
    // TODO: Unbind the keyboard events. But I'll have to cache them
    keyboard.bind('up', partial(this.navigate, 'up'))
    keyboard.bind('down', partial(this.navigate, 'down'))
    keyboard.bind('left', partial(this.navigate, 'left'))
    keyboard.bind('right', partial(this.navigate, 'right'))
    keyboard.bind('tab', partial(this.navigate, 'right'))
    keyboard.bind('shift + tab', partial(this.navigate, 'left'))
    keyboard.bind('shift + enter', () => {}) // differentiate from just enter
    keyboard.bind('enter', this.onPressEnter)
    keyboard.bind('escape', this.onPressEscape)
  }

  navigate (direction, evt) {
    const { selectedCell, activeSheet } = this.props
    const isCellSelected = (selectedCell.rowIndex !== null)
    const isEditing = (selectedCell.editing === true)
    const rowCount = activeSheet.rows.length
    const columnCount = activeSheet.columns.length

    if (isCellSelected && !isEditing) {
      this.props.emit('ui:navigate', { direction, rowCount, columnCount })
      evt.preventDefault()
    }
  }

  onClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isSelected = el.classList.contains('selected')

    if (!isSelected) {
      const payload = { rowIndex, columnIndex, editing: false }
      this.props.emit('ui:selectCell', payload)
    }
  }

  onDblClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isEditing = el.classList.contains('editing')

    if (!isEditing && this.isCellEditable(rowIndex, columnIndex)) {
      const payload = { rowIndex, columnIndex, editing: true }
      this.props.emit('ui:selectCell', payload)
    }
  }

  onClickAddColumn (evt) {
    this.props.emit('store:insertColumn')

    const columns = this.props.activeSheet.columns
    const lastColumnIndex = columns.length
    const payload = {
      rowIndex: -1,
      columnIndex: lastColumnIndex,
      editing: true
    }
    this.props.emit('ui:selectCell', payload)
    evt.stopPropagation()
  }

  isCellEditable (rowIndex, columnIndex) {
    const columns = this.props.activeSheet.columns
    const isHeaderSelected = (rowIndex === -1)
    const isColumnEditable = columns[columnIndex].editable
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
