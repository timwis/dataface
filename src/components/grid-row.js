const html = require('choo/html')

const gridCell = require('./grid-cell')

module.exports = function gridRow (state, rowIndex) {
  const { columns, rows, selectedCell, rowMenu } = state
  const row = rows[rowIndex] || {} // allow empty row at end
  const isRowSelected = (rowMenu.rowIndex === rowIndex)
  const classList = isRowSelected ? 'row-selected' : ''

  return html`
    <tr class=${classList}>
      ${columns.map(createCell)}
      <td class="extra"></td>
    </tr>
  `

  function createCell (column, columnIndex) {
    const cell = row[column.name]
    const opts = {
      value: cell ? (cell.newValue || cell.value) : '',
      rowIndex,
      columnIndex,
      isHeader: false,
      isSelected: (rowIndex === selectedCell.rowIndex) &&
                  (columnIndex === selectedCell.columnIndex),
      isEditing: selectedCell.editing
    }
    return gridCell(opts)
  }
}
