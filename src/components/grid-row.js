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
    const currentValue = cell ? cell.value : ''
    const pendingValue = selectedCell.pendingValue
    const isSelected = (rowIndex === selectedCell.rowIndex) &&
                       (columnIndex === selectedCell.columnIndex)
    const opts = {
      value: isSelected && pendingValue !== null ? pendingValue : currentValue,
      rowIndex,
      columnIndex,
      isHeader: false,
      isSelected,
      isEditing: selectedCell.editing
    }
    return gridCell(opts)
  }
}
