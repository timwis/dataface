const html = require('choo/html')
const css = require('sheetify')
const keyboard = require('keyboardjs')
const offset = require('mouse-event-offset')

const setCursor = require('../util').setCursor
const contextMenu = require('../components/context-menu.js')

const prefix = css('./table.css')

module.exports = function table (state, emit) {
  const { fields, rows } = state.activeSheet
  const selectedCell = state.selectedCell

  const moveCellUp = moveCell.bind(this, 'up')
  const moveCellDown = moveCell.bind(this, 'down')
  const moveCellLeft = moveCell.bind(this, 'left')
  const moveCellRight = moveCell.bind(this, 'right')
  const noop = () => {}

  return html`
    <div class=${prefix}>
      <table class="table is-bordered is-striped is-narrow"
             onload=${onload} onunload=${onunload}>
        <thead>
          <tr>
            ${fields.map(tableHeader)}
          </tr>
        </thead>
        <tbody>
          ${rows.map(tableRow)}
        </tbody>
      </table>
      ${headerMenu(state.headerMenu)}
    </div>
  `

  function headerMenu (headerMenuState) {
    const items = [
      { label: 'Set type', onclick: () => console.log('Clicked "set type"') },
      { label: 'Remove column', onclick: () => console.log('Clicked "remove column"') }
    ]
    return headerMenuState.visible
      ? contextMenu(items, headerMenuState, hideHeaderMenu)
      : ''
  }

  function onload (el) {
    keyboard.bind('up', moveCellUp)
    keyboard.bind('down', moveCellDown)
    keyboard.bind('left', moveCellLeft)
    keyboard.bind('right', moveCellRight)
    keyboard.bind('tab', moveCellRight)
    keyboard.bind('shift + tab', moveCellLeft)
    keyboard.bind('shift + enter', noop) // differentiate from just enter
    keyboard.bind('enter', enter)
  }

  function onunload (el) {
    keyboard.unbind('up', moveCellUp)
    keyboard.unbind('down', moveCellDown)
    keyboard.unbind('left', moveCellLeft)
    keyboard.unbind('right', moveCellRight)
    keyboard.unbind('tab', moveCellRight)
    keyboard.unbind('shift + tab', moveCellLeft)
    keyboard.unbind('shift + enter', noop)
    keyboard.unbind('enter', enter)
  }

  function tableHeader (field) {
    return html`
      <th oncontextmenu=${showHeaderMenu}>
        ${field.name}
      </th>
    `
  }

  function tableRow (row, rowIndex) {
    return html`
      <tr>
        ${fields.map((field, columnIndex) => {
          const value = row[field.name] || ''

          if (isSelectedCell(rowIndex, columnIndex)) {
            if (selectedCell.editing) {
              return tableCellEditing(value)
            } else {
              return tableCellSelected(value, rowIndex, columnIndex)
            }
          } else {
            return tableCellDeselected(value, rowIndex, columnIndex)
          }
        })}
      </tr>
    `
  }

  function tableCellEditing (value) {
    return html`
      <td class="selected editing"
          contenteditable="true"
          onblur=${deselectCell}
          onload=${setCursorInSelectedCell}>
        ${value}
      </td>
    `
  }

  function tableCellSelected (value, rowIndex, columnIndex) {
    const edit = selectCell.bind(this, rowIndex, columnIndex, true)

    return html`
      <td class="selected" ondblclick=${edit}>
        ${value}
      </td>
    `
  }

  function tableCellDeselected (value, rowIndex, columnIndex) {
    const select = selectCell.bind(this, rowIndex, columnIndex, false)
    const edit = selectCell.bind(this, rowIndex, columnIndex, true)

    return html`
      <td onclick=${select} ondblclick=${edit}>
        ${value}
      </td>
    `
  }

  function showHeaderMenu (evt) {
    const parentEl = evt.currentTarget.parentNode
    const [x, y] = offset(evt, parentEl)
    emit('table:headerMenu', { x, y, visible: true })
    evt.preventDefault()
  }

  function hideHeaderMenu () {
    emit('table:headerMenu', { visible: false })
  }

  function setCursorInSelectedCell () {
    // Can't use the `el` arg passed because of dom morphing.
    // It's probably a bug with nanomorph, technically
    const el = document.querySelector('.selected')
    setCursor(el)
  }

  function selectCell (rowIndex, columnIndex, editing, evt) {
    const payload = { rowIndex, columnIndex, editing }
    emit('table:selectCell', payload)
  }

  function deselectCell (evt) {
    const { rowIndex, columnIndex } = state.selectedCell
    const value = evt.target.innerText
    save(rowIndex, columnIndex, value)
    emit('table:deselectCell')
  }

  function isSelectedCell (rowIndex, columnIndex) {
    return state.selectedCell.rowIndex === rowIndex &&
      state.selectedCell.columnIndex === columnIndex
  }

  function moveCell (direction, evt) {
    const { rowIndex, columnIndex, editing } = state.selectedCell
    const payload = {}

    // Don't do anything if no cell is selected or editing
    if (rowIndex === null || editing) return

    switch (direction) {
      case 'up':
        const prevRowIndex = rowIndex - 1
        payload.rowIndex = Math.max(prevRowIndex, 0)
        break
      case 'down':
        const nextRowIndex = rowIndex + 1
        const lastRowIndex = rows.length - 1
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
    emit('table:selectCell', payload)
    evt.preventDefault()
  }

  function enter (evt) {
    const { rowIndex, columnIndex, editing } = state.selectedCell

    // Don't do anything if no cell is selected
    if (rowIndex === null) return

    if (editing) {
      const value = evt.target.innerText
      save(rowIndex, columnIndex, value)
    }

    // Set editing to opposite of current state
    emit('table:selectCell', {editing: !editing})
    evt.preventDefault()
  }

  function save (rowIndex, columnIndex, value) {
    const field = fields[columnIndex].name
    const oldValue = rows[rowIndex][field]
    if (value !== oldValue) {
      const updates = { [field]: value }
      emit('sheet:update', { rowIndex, updates })
    }
  }
}
