const html = require('choo/html')
const css = require('sheetify')

const nav = require('../components/nav')
const menu = require('../components/menu')

const prefix = css`
  .table-container {
    overflow-x: auto;
  }
`

module.exports = (view) => (state, emit) => {
  const { sheets, activeSheet } = state.store

  return html`
    <body>
      ${nav()}
      <div class="container ${prefix}">
        <div class="columns" onload=${onload}>
          <div class="column is-one-quarter">
            ${menu(sheets, activeSheet.name)}
          </div>
          <div class="column table-container">
            ${activeSheet.fields !== null
              ? view(state, emit)
              : ''}
          </div>
        </div>
      </div>
    </body>
  `

  function onload (el) {
    emit('store:getList')
  }
}
