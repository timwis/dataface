const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    overflow-x: auto;
  }
`

module.exports = function table (fields, rows) {
  return html`
    <div class=${prefix}>
      <table class="table is-bordered is-striped is-narrow">
        <thead>
          <tr>
            ${fields.map((field) => html`
              <th>${field.name}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row)}
        </tbody>
      </table>
    </div>
  `

  function row (data) {
    return html`
      <tr>
        ${fields.map((field) => html`
          <td>${data[field.name] || ''}</td>
        `)}
      </tr>
    `
  }
}
