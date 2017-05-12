const html = require('choo/html')
const css = require('sheetify')
const keyboard = require('keyboardjs')
const HyperList = require('hyperlist-component')
const onload = require('on-load')

const setCursor = require('../util').setCursor
const contextMenu = require('../components/context-menu.js')
const prefix = css('./grid.css')

const opts = {
  height: 500,
  itemHeight: 34,
  eachItem: tableRow,
  getTotal: (state) => state.rows.length
}
const hyperList = new HyperList('tbody', opts)

module.exports = function grid (state, emit) {
  const { fields, rows } = state.store.activeSheet
  const selectedCell = Object.assign({}, state.ui.selectedCell)
  const selectedCellValue = getSelectedCellValue(fields, rows, selectedCell)

  const moveCellUp = moveCell.bind(this, 'up')
  const moveCellDown = moveCell.bind(this, 'down')
  const moveCellLeft = moveCell.bind(this, 'left')
  const moveCellRight = moveCell.bind(this, 'right')
  const noop = () => {}

  const tableRowState = { fields, rows, selectedCell, rowMenu: state.ui.rowMenu }
  const tbody = hyperList.render(tableRowState)
  tbody.oncontextmenu = onMenu.bind(null, 'row')

  const tree = html`
    <div class=${prefix} onload=${onLoad} onunload=${onUnload}>
      <table class="table is-bordered is-striped is-narrow"
        onclick=${onClickCell} ondblclick=${onDblClickCell} oninput=${onInputCell}>
        <thead oncontextmenu=${onMenu.bind(null, 'header')}>
          <tr>
            ${fields.map(tableHeader)}
            <th class="extra" onclick=${onClickExtraColumn}>+</th>
          </tr>
        </thead>
        ${tbody}
      </table>
      ${headerMenu(state.ui.headerMenu)}
      ${rowMenu(state.ui.rowMenu)}
      ${hiddenInput(selectedCellValue)}
    </div>
  `

  const table = tree.querySelector('table')
  table.addEventListener('blur', onBlurCell, true)

  if (!selectedCell.editing) {
    window.setTimeout(() => setCursorInHiddenInput(), 100)
  }

  return tree

  function onInputCell (evt) {
    if (selectedCell.editing) {
      const { rowIndex, columnIndex } = selectedCell
      const newValue = evt.target.innerText
      const payload = { rowIndex, columnIndex, newValue }
      emit('store:setNewValue', payload)
    }
  }

  function getSelectedCellValue (fields, rows, selectedCell) {
    const { rowIndex, columnIndex } = selectedCell
    const isCellSelected = (rowIndex !== null && columnIndex !== null)
    const isHeaderSelected = isCellSelected && rowIndex === -1
    const field = fields[columnIndex]
    const row = rows[rowIndex]

    if (isHeaderSelected && field) {
      return field.name
    } else if (isCellSelected && row && field && row[field.name]) {
      return row[field.name].value
    } else {
      return ''
    }
  }

  function hiddenInput (value) {
    return html`
      <input class="hidden-input" value=${value} oninput=${onTypeInHiddenInput}>
    `
  }

  function onTypeInHiddenInput (evt) {
    const { rowIndex, columnIndex } = selectedCell
    const isCellSelected = (rowIndex !== null && columnIndex !== null)
    const newValue = evt.target.value
    const payload = { rowIndex, columnIndex, newValue }

    if (isCellSelected) {
      emit('store:setNewValue', payload)
      emit('ui:selectCell', {editing: true})
    }
  }

  function headerMenu (headerMenuState) {
    const columnIndex = headerMenuState.columnIndex
    const items = [
      { label: 'Remove column', onclick: onDeleteField.bind(null, columnIndex) }
    ]
    return headerMenuState.visible
      ? contextMenu(items, headerMenuState, hideMenus)
      : ''
  }

  function rowMenu (rowMenuState) {
    const rowIndex = rowMenuState.rowIndex
    const items = [
      { label: 'Remove row', onclick: onDeleteRow.bind(null, rowIndex) }
    ]
    return rowMenuState.visible
      ? contextMenu(items, rowMenuState, hideMenus)
      : ''
  }

  function onDeleteRow (rowIndex, evt) {
    emit('store:deleteRow', {rowIndex})
    if (selectedCell.rowIndex === rowIndex) {
      emit('ui:selectCell', { rowIndex: null })
    }
  }

  function onMenu (menu, evt) {
    const eventName = menu === 'header' ? 'ui:headerMenu' : 'ui:rowMenu'
    const x = evt.pageX || evt.clientX
    const y = evt.pageY || evt.clientY
    const rowIndex = numericAttribute(evt.target.dataset.rowIndex)
    const columnIndex = numericAttribute(evt.target.dataset.columnIndex)
    emit(eventName, { x, y, rowIndex, columnIndex, visible: true })
    evt.preventDefault()
  }

  function hideMenus () {
    emit('ui:headerMenu', { visible: false })
    emit('ui:rowMenu', { visible: false })
  }

  function onClickCell (evt) {
    const el = evt.target
    const rowIndex = numericAttribute(el.dataset.rowIndex)
    const columnIndex = numericAttribute(el.dataset.columnIndex)
    const isSelected = el.classList.contains('selected')

    if (!isSelected) {
      const payload = { rowIndex, columnIndex, editing: false }
      emit('ui:selectCell', payload)
    }
  }

  function onClickExtraColumn (evt) {
    emit('store:insertField')

    // Start editing the new column
    const lastColumnIndex = state.store.activeSheet.fields.length
    const payload = { rowIndex: -1, columnIndex: lastColumnIndex, editing: true }
    emit('ui:selectCell', payload)
    evt.stopPropagation()
  }

  function onDeleteField (columnIndex, evt) {
    emit('store:deleteField', { columnIndex })
    if (selectedCell.columnIndex === columnIndex) {
      emit('ui:selectCell', { columnIndex: null })
    }
  }

  function onDblClickCell (evt) {
    const el = evt.target
    const rowIndex = numericAttribute(el.dataset.rowIndex)
    const columnIndex = numericAttribute(el.dataset.columnIndex)
    const isEditing = el.classList.contains('editing')
    if (!isEditing) {
      const payload = { rowIndex, columnIndex, editing: true }
      emit('ui:selectCell', payload)
    }
  }

  function onBlurCell (evt) {
    const { rowIndex, columnIndex, editing } = state.ui.selectedCell
    if (rowIndex === -1) {
      saveHeader(columnIndex)
    } else {
      saveRow(rowIndex, columnIndex)
    }
    if (editing) { // will be false if user hit enter b/c of enter listener
      emit('ui:selectCell', {editing: false})
    }
  }

  function onLoad (el) {
    keyboard.bind('up', moveCellUp)
    keyboard.bind('down', moveCellDown)
    keyboard.bind('left', moveCellLeft)
    keyboard.bind('right', moveCellRight)
    keyboard.bind('tab', moveCellRight)
    keyboard.bind('shift + tab', moveCellLeft)
    keyboard.bind('shift + enter', noop) // differentiate from just enter
    keyboard.bind('enter', onPressEnter)
    keyboard.bind('escape', onPressEscape)
  }

  function onUnload (el) {
    keyboard.unbind('up', moveCellUp)
    keyboard.unbind('down', moveCellDown)
    keyboard.unbind('left', moveCellLeft)
    keyboard.unbind('right', moveCellRight)
    keyboard.unbind('tab', moveCellRight)
    keyboard.unbind('shift + tab', moveCellLeft)
    keyboard.unbind('shift + enter', noop)
    keyboard.unbind('enter', onPressEnter)
    keyboard.unbind('escape', onPressEscape)
  }

  function moveCell (direction, evt) {
    const { rowIndex, columnIndex, editing } = state.ui.selectedCell
    const payload = {}

    // Don't do anything if no cell is selected or editing
    if (rowIndex === null || editing) return

    switch (direction) {
      case 'up':
        const prevRowIndex = rowIndex - 1
        payload.rowIndex = Math.max(prevRowIndex, -1) // -1 is header
        break
      case 'down':
        const nextRowIndex = rowIndex + 1
        const lastRowIndex = rows.length // plus one for empty row
        payload.rowIndex = Math.min(nextRowIndex, lastRowIndex)
        break
      case 'left':
        const prevColumnIndex = columnIndex - 1
        payload.columnIndex = Math.max(prevColumnIndex, 0)
        break
      case 'right':
        const nextColumnIndex = columnIndex + 1
        const lastColumnIndex = fields.length - 1
        payload.columnIndex = Math.min(nextColumnIndex, lastColumnIndex)
        break
    }
    emit('ui:selectCell', payload)
    evt.preventDefault()
  }

  function onPressEnter (evt) {
    const { rowIndex, columnIndex, editing } = state.ui.selectedCell

    // Don't do anything if no cell is selected
    if (rowIndex === null || columnIndex === null) return

    // Set editing to opposite of current state
    emit('ui:selectCell', {editing: !editing})
    evt.preventDefault()
  }

  function onPressEscape (evt) {
    const { rowIndex, columnIndex } = state.ui.selectedCell

    // Don't do anything if no cell is selected
    if (rowIndex === null || columnIndex === null) return

    emit('store:setNewValue', { rowIndex, columnIndex, newValue: undefined })
    emit('ui:selectCell', { editing: false })
    evt.preventDefault()
  }

  function saveRow (rowIndex, columnIndex) {
    const field = state.store.activeSheet.fields[columnIndex].name
    const row = state.store.activeSheet.rows[rowIndex]
    const value = row && row[field].newValue
    const oldValue = row && row[field].value
    const updates = { [field]: value }

    if (!row && value) {
      emit('store:insertRow', { rowIndex, updates })
    } else if (row && value !== undefined && value !== oldValue) {
      emit('store:updateRow', { rowIndex, updates })
    } else {
      console.log('not updating', value, oldValue)
    }
  }

  function saveHeader (columnIndex) {
    const value = state.store.activeSheet.fields[columnIndex].newName
    const oldValue = state.store.activeSheet.fields[columnIndex].name
    if (value !== undefined && value !== oldValue) {
      emit('store:renameField', { columnIndex, oldValue, value })
    }
  }

  function tableHeader (field, columnIndex) {
    const selectedCell = state.ui.selectedCell
    const opts = {
      value: field.newName || field.name,
      rowIndex: -1,
      columnIndex,
      isHeader: true,
      isSelected: (selectedCell.rowIndex === -1) &&
                  (selectedCell.columnIndex === columnIndex),
      isEditing: selectedCell.editing
    }
    return tableCell(opts)
  }
}

function tableRow (tableRowState, rowIndex) {
  const { fields, rows, selectedCell, rowMenu } = tableRowState
  const row = rows[rowIndex]
  const classList = rowMenu.rowIndex === rowIndex ? 'row-selected' : ''

  return html`
    <tr class=${classList}>
      ${fields.map((field, columnIndex) => {
        const rowField = row[field.name]
        const opts = {
          value: rowField ? (rowField.newValue || rowField.value) : '',
          rowIndex,
          columnIndex,
          isHeader: false,
          isSelected: (rowIndex === selectedCell.rowIndex) &&
                      (columnIndex === selectedCell.columnIndex),
          isEditing: selectedCell.editing
        }
        return tableCell(opts)
      })}
      <td class="extra"></td>
    </tr>
  `
}

function tableCell (opts) {
  const tagName = opts.isHeader ? 'th' : 'td'
  const el = document.createElement(tagName)
  el.innerText = opts.value

  el.dataset.rowIndex = opts.rowIndex
  el.dataset.columnIndex = opts.columnIndex

  if (opts.isSelected) {
    el.classList.add('selected')
  }

  if (opts.isSelected && opts.isEditing) {
    el.classList.add('editing')
    el.setAttribute('contenteditable', true)
    onload(el, setCursorInSelectedCell)
  }

  return el
}

function setCursorInSelectedCell () {
  // Can't use the `el` arg passed because of dom morphing.
  // It's probably a bug with nanomorph, technically
  const el = document.querySelector('.selected')
  setCursor(el)
}

function setCursorInHiddenInput () {
  const el = document.querySelector('.hidden-input')
  el.focus()
  el.select()
}

function numericAttribute (val) {
  return (val === '' || val === undefined) ? null : +val
}
