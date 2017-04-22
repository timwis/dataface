const html = require('choo/html')
const css = require('sheetify')
const Nanocomponent = require('nanocomponent')
const Clusterize = require('clusterize.js')

css('clusterize.js/clusterize.css')

const prefix = css`
  :host {
    max-height: 100%;
  }
`

class Grid extends Nanocomponent {
  _render (fields, rows) {
    console.log('rendering')
    this.fields = fields
    this.rows = rows

    return html`
      <div class="clusterize-scroll ${prefix}" id="clusterize-scroll">
        <table class="table is-bordered is-striped is-narrow">
          <thead>
            <tr>${fields.map(this.tableHeader)}</tr>
          </thead>
          <tbody class="clusterize-content" id="clusterize-content">
          </tbody>
        </table>
      </div>
    `
  }

  _update (fields, rows) {
    if (this.clusterize) { // TODO: Update headers
      this.fields = fields
      this.rows = rows
      this.clusterize.update(this.getClusterizeData())
    }
    return false
  }

  _load () {
    console.log('initializing')
    this.clusterize = new Clusterize({
      scrollId: 'clusterize-scroll',
      contentId: 'clusterize-content',
      rows: this.getClusterizeData()
    })
  }

  getClusterizeData () {
    return this.rows.map(this.tableRow.bind(this))
  }

  tableHeader (field) {
    return html`
      <th>
        ${field.name}
      </th>
    `
  }

  tableRow (row, rowIndex) {
    return `
      <tr>
        ${this.fields.map((field, columnIndex) => {
          const value = row[field.name] || ''

          return this.tableCellDeselected(value, rowIndex, columnIndex)
        }).join('')}
      </tr>
    `
  }

  tableCellDeselected (value, rowIndex, columnIndex) {
    return `
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
