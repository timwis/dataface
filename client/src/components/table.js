const html = require('choo/html')
const css = require('sheetify')
const setCursor = require('../util').setCursor

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
    outline: none;
    background-color: #fff;
    box-shadow: 0 0 5px 3px #ccc;
  }
`

module.exports = function table (state, emit) {
  const { fields, rows } = state.activeSheet
  const selectedCell = state.selectedCell

  return html`
    <table class="${prefix} table is-bordered is-striped is-narrow">
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

  function tableRow (row, rowIndex) {
    return html`
      <tr>
        ${fields.map((field, columnIndex) => {
          const value = row[field.name] || ''

          if (isSelectedCell(rowIndex, columnIndex)) {
            return html`
              <td class="selected is-warning"
                  contenteditable="true"
                  onblur=${deselectCell}
                  onload=${setCursorInSelectedCell}>
                ${value}
              </td>
            `
          } else {
            const selectCb = selectCell.bind(this, rowIndex, columnIndex)

            return html`
              <td ondblclick=${selectCb}>
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

  function selectCell (rowIndex, columnIndex, evt) {
    const payload = { rowIndex, columnIndex }
    emit('table:selectCell', payload)
  }

  function deselectCell (evt) {
    emit('table:deselectCell')
  }

  function isSelectedCell (rowIndex, columnIndex) {
    return selectedCell.rowIndex === rowIndex &&
      selectedCell.columnIndex === columnIndex
  }
}
