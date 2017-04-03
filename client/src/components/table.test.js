const test = require('ava')
require('jsdom-global')()

const table = require('./table')
const noop = () => {}

const sampleData = {
  fields: ['id', 'username', 'email'],
  rows: [
    { id: 1, username: 'benazir', email: 'benazir@bhutto.com' },
    { id: 2, username: 'victoria', email: 'victoria@queens.com' },
    { id: 3, username: 'hillary', email: 'hillary@clinton.com' }
  ]
}

const emptySelectedCell = {
  rowIndex: null,
  columnIndex: null,
  editing: false
}

test('renders table', (t) => {
  const state = {
    activeSheet: sampleData,
    selectedCell: emptySelectedCell
  }
  const el = table(state, noop)

  const rowCount = el.querySelectorAll('tbody tr').length
  t.is(rowCount, 3)

  const columnCount = el.querySelectorAll('thead th').length
  t.is(columnCount, 3)
})

test('selected cell has "selected" class', (t) => {
  const state = {
    activeSheet: sampleData,
    selectedCell: {
      rowIndex: 1,
      columnIndex: 1,
      editing: false
    }
  }
  const el = table(state, noop)
  const selectedCells = el.querySelectorAll('.selected')
  t.is(selectedCells.length, 1, '1 cell is selected')

  const selectedCell = selectedCells[0]
  t.is(getIndexInParent(selectedCell), 1, 'second column')
  t.is(getIndexInParent(selectedCell.parentNode), 1, 'second row')
})

function getIndexInParent (el) {
  const siblings = Array.from(el.parentNode.children)
  return siblings.indexOf(el)
}
