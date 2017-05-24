const html = require('choo/html')
const css = require('sheetify')
const HyperList = require('hyperlist-component')
const partial = require('lodash/partial')
const bindAll = require('lodash/bindAll')
const pick = require('lodash/pick')
const keyboard = require('keyboardjs')

const gridRow = require('./grid-row')
const gridCellHeader = require('./grid-cell-header')
const prefix = css('./grid.css')
const { numericAttribute } = require('../util')

const HEADER_INDEX = -1

module.exports = class Grid {
  constructor () {
    this.hyperList = initHyperList()
    bindAll(this, ['onLoad', 'onClickCell', 'onDblClickCell', 'onClickAddColumn',
      'navigate', 'onPressEnter', 'onPressEscape', 'onBlurCell', 'onInputCell'])
  }

  render (props) {
    this.props = props
    const { activeSheet, selectedCell } = this.props
    const { columns, rows } = activeSheet
    const gridCellHeaderWithState = partial(gridCellHeader, this.props.selectedCell)

    const rowMenu = {}
    const gridRowState = { columns, rows, selectedCell, rowMenu }
    const tbody = this.hyperList.render(gridRowState)

    const tree = html`
      <div class=${prefix} onload=${this.onLoad}>
        <table class="table is-bordered is-striped is-narrow"
          onclick=${this.onClickCell} ondblclick=${this.onDblClickCell}
          oninput=${this.onInputCell}>
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

    const table = tree.querySelector('table')
    table.addEventListener('blur', this.onBlurCell, true) // useCapture=true

    return tree
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
    const activeSheet = this.props.activeSheet
    const rowCount = activeSheet.rows.length
    const columnCount = activeSheet.columns.length

    if (this.isAnyCellSelected() && !this.isEditing()) {
      this.props.emit('ui:navigate', { direction, rowCount, columnCount })
      evt.preventDefault()
    }
  }

  onClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isSelected = el.classList.contains('selected')

    if (!isSelected) {
      const payload = { rowIndex, columnIndex }
      this.props.emit('ui:selectCell', payload)
    }
  }

  onDblClickCell (evt) {
    const el = evt.target
    const { rowIndex, columnIndex } = getElIndexes(el)
    const isEditing = el.classList.contains('editing')

    if (!isEditing && this.isCellEditable(rowIndex, columnIndex)) {
      const payload = { rowIndex, columnIndex }
      this.props.emit('ui:selectCell', payload)
      this.props.emit('ui:setCellEditing')
    }
  }

  onInputCell (evt) {
    if (this.isEditing()) {
      const value = evt.target.innerText
      this.props.emit('ui:setPendingValue', value)
    }
  }

  onBlurCell (evt) {
    if (this.isHeaderSelected()) {
      this.saveSelectedHeaderCell()
    } else {
      this.saveSelectedCell()
    }

    // if (this.isEditing() { // will be false if user hit enter
    //   this.props.emit('ui:selectCell', { editing: false })
    // }
  }

  saveSelectedCell () {
    const payload = pick(this.props.selectedCell, ['rowIndex', 'columnIndex', 'pendingValue'])
    this.props.emit('store:saveCell', payload)
  }

  saveSelectedHeaderCell () {
  }

  onClickAddColumn (evt) {
    this.props.emit('store:insertColumn')

    const columns = this.props.activeSheet.columns
    const lastColumnIndex = columns.length
    const payload = {
      rowIndex: HEADER_INDEX,
      columnIndex: lastColumnIndex
    }
    this.props.emit('ui:selectCell', payload)
    this.props.emit('ui:setCellEditing')
    evt.stopPropagation()
  }

  onPressEnter (evt) {
    if (this.isAnyCellSelected() && this.isSelectedCellEditable()) {
      if (this.isEditing()) {
        this.props.emit('ui:setCellNotEditing')
      } else {
        this.props.emit('ui:setCellEditing')
      }
      evt.preventDefault()
    }
  }

  onPressEscape (evt) {
    if (this.isAnyCellSelected() && this.isEditing()) {
      // TODO: erase saved value
      this.props.emit('ui:setCellNotEditing')
      evt.preventDefault()
    }
  }

  isAnyCellSelected () {
    const { rowIndex, columnIndex } = this.props.selectedCell
    return (rowIndex !== null && columnIndex !== null)
  }

  isEditing () {
    return this.props.selectedCell.editing
  }

  isSelectedCellEditable () {
    const { rowIndex, columnIndex } = this.props.selectedCell
    return this.isCellEditable(rowIndex, columnIndex)
  }

  isCellEditable (rowIndex, columnIndex) {
    const columns = this.props.activeSheet.columns
    const isColumnEditable = columns[columnIndex].editable
    return this.isHeaderSelected() || isColumnEditable
  }

  isHeaderSelected () {
    return this.props.selectedCell.rowIndex === HEADER_INDEX
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
