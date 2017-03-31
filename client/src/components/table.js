const html = require('choo/html')
const css = require('sheetify')
const setCursor = require('../util').setCursor
const keyboard = require('keyboardjs')

const noop = () => {}
const prefix = css`
  td {
    cursor: cell;
    white-space: nowrap;
    user-select: none;
  }
  td.selected {
    cursor: inherit;
    border: 2px #00d1b2 solid !important;
    box-sizing: border-box;
  }
  td.editing {
    cursor: inherit;
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 5px 3px #ccc;
  }
`

module.exports = function table (state, emit) {
  const { fields, rows } = state.activeSheet
  const selectedCell = state.selectedCell

  return html`
    <table class="${prefix} table is-bordered is-striped is-narrow"
           onload=${onload}>
      <thead>
        <tr>
          ${fields.map((field) => html`
            <th>${field.name}</th>
          `)}
        </tr>
      </thead>
      <tbody>
        ${rows.map(tableRow)}
      </tbody>
    </table>
  `

  function onload (el) {
    keyboard.bind('up', moveCell.bind(this, 'up'))
    keyboard.bind('down', moveCell.bind(this, 'down'))
    keyboard.bind('left', moveCell.bind(this, 'left'))
    keyboard.bind('right', moveCell.bind(this, 'right'))
    keyboard.bind('shift + enter', noop) // differentiate from just enter
    keyboard.bind('enter', enter)
  }

  function tableRow (row, rowIndex) {
    return html`
      <tr>
        ${fields.map((field, columnIndex) => {
          const value = row[field.name] || ''
          const selectCellCb = selectCell.bind(this, rowIndex, columnIndex, false)
          const editCellCb = selectCell.bind(this, rowIndex, columnIndex, true)

          if (isSelectedCell(rowIndex, columnIndex)) {
            if (selectedCell.editing) {
              return html`
                <td class="selected editing"
                    contenteditable="true"
                    onblur=${deselectCell}
                    onload=${setCursorInSelectedCell}>
                  ${value}
                </td>
              `
            } else {
              return html`
                <td class="selected" ondblclick=${editCellCb}>
                  ${value}
                </td>
              `
            }
          } else {
            return html`
              <td onclick=${selectCellCb} ondblclick=${editCellCb}>
                ${value}
              </td>
            `
          }
        })}
      </tr>
    `
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
    emit('table:deselectCell')
  }

  function isSelectedCell (rowIndex, columnIndex) {
    return state.selectedCell.rowIndex === rowIndex &&
      state.selectedCell.columnIndex === columnIndex
  }

  function moveCell (direction, evt) {
    const { rowIndex, columnIndex, editing } = state.selectedCell
    const payload = { rowIndex, columnIndex, editing: false }

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

    const payload = {
      rowIndex,
      columnIndex,
      editing: !editing
    }
    emit('table:selectCell', payload)
    evt.preventDefault()
  }
}
