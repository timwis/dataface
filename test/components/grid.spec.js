const test = require('ava')
const { mount, trigger, mockStore } = require('vuenit')
const keyCodes = require('../helpers/keycodes')

const Grid = require('../../src/components/grid.vue')
const fixtures = {
  columns: require('../fixtures/schema.json'),
  rows: require('../fixtures/rows.json')
}

test('renders correct number of columns', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })

  const expected = fixtures.columns.length + 1 // extra "add" column
  const renderedColumns = vm.$find('th')
  t.is(renderedColumns.length, expected)
})

test('renders column names', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })
  const renderedColumns = vm.$find('th')

  fixtures.columns.forEach((column, index) => {
    t.is(column.name, renderedColumns[index].textContent)
  })
})

test('renders columns with index attributes', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })
  const renderedColumns = vm.$find('th:not(.extra-column)')
  const HEADER_ROW = '-1'

  renderedColumns.forEach((column, index) => {
    t.is(column.getAttribute('data-row-index'), HEADER_ROW)
    t.is(column.getAttribute('data-column-index'), index + '')
  })
})

test('renders correct number of rows', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })

  const expected = fixtures.rows.length + 1 // extra "add" row
  const renderedRows = vm.$find('tbody tr')
  t.is(renderedRows.length, expected)
})

test('renders row text', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })

  const renderedRows = vm.$find('tbody tr')
  fixtures.rows.forEach((row, rowIndex) => {
    fixtures.columns.forEach((column, columnIndex) => {
      const cell = renderedRows[rowIndex].children[columnIndex]
      t.is(cell.textContent, row[column.name] + '')
    })
  })
})

test('cells are focusable', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })

  const firstCell = vm.$findOne('tbody td')
  firstCell.focus()
  t.is(document.activeElement, firstCell)
})

test('navigates focus via arrow keys', (t) => {
  const $store = sampleStore()
  const vm = mount(Grid, { inject: { $store } })

  const firstCell = vm.$findOne('tbody td')
  firstCell.focus()

  // right
  keydown('right')
  t.is(document.activeElement, firstCell.nextElementSibling)

  // left
  keydown('left')
  t.is(document.activeElement, firstCell)

  // down
  keydown('down')
  const secondRow = vm.$find('tbody tr')[1]
  const secondRowFirstCell = secondRow.children[0]
  t.is(document.activeElement, secondRowFirstCell)

  // up
  keydown('up')
  t.is(document.activeElement, firstCell)
})

function keydown (key) {
  trigger(document.activeElement, 'keydown', { keyCode: keyCodes[key] })
}

function sampleStore () {
  return mockStore({
    modules: {
      db: {
        activeSheet: {
          columns: fixtures.columns,
          rows: fixtures.rows,
          keys: ['id']
        }
      },
      ui: { editing: false }
    }
  })
}
