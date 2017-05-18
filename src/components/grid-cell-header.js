const gridCell = require('./grid-cell')

module.exports = function gridHeader (selectedCell, column, columnIndex) {
  const opts = {
    value: column.newName || column.name,
    rowIndex: -1,
    columnIndex,
    isHeader: true,
    isSelected: (selectedCell.rowIndex === -1) &&
                (selectedCell.columnIndex === columnIndex),
    isEditing: selectedCell.editing
  }
  return gridCell(opts)
}
