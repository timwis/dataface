const html = require('choo/html')
const css = require('sheetify')
const CacheComponent = require('cache-component')
const HyperList = require('hyperlist').default

const prefix = css`
  thead, tbody {
    display: block;
  }
`

class Grid extends CacheComponent {
  _render (fields, rows) {
    const tbody = document.createElement('tbody')

    HyperList.create(tbody, {
      height: 500,
      itemHeight: 34,
      total: rows.length,
      generate: (index) => this.tableRow(fields, rows[index], index)
    })

    // Set scrollTop = 0 (in case switching between sheets)
    window.setTimeout(() => document.querySelector('tbody').scrollTop = 0, 1)

    return html`
      <div class=${prefix}>
        <table class="table is-bordered is-striped is-narrow">
          <thead>
            <tr>${fields.map(this.tableHeader)}</tr>
          </thead>
          ${tbody}
        </table>
      </div>
    `
  }

  _update (fields, rows) {
    return true
  }

  _load () {
  }

  tableHeader (field) {
    return html`
      <th>
        ${field.name}
      </th>
    `
  }

  tableRow (fields, row, rowIndex) {
    return html`
      <tr>
        ${fields.map((field, columnIndex) => {
          const value = row[field.name] || ''

          return this.tableCellDeselected(value, rowIndex, columnIndex)
        })}
      </tr>
    `
  }

  tableCellDeselected (value, rowIndex, columnIndex) {
    return html`
      <td data-row-index=${rowIndex}
          data-column-index=${columnIndex}>
        ${value}
      </td>
    `
  }
}

const grid = new Grid()

module.exports = function (state, emit) {
  const { fields, rows } = state.store.activeSheet
  return grid.render(fields, rows)
}
