const html = require('choo/html')

const nav = require('./components/nav')
const menu = require('./components/menu')
const table = require('./components/table')

module.exports = function home (state, emit) {
  const { sheets, activeSheet } = state
  return html`
    <body>
      ${nav()}
      <div class="container">
        <div class="columns" onload=${onload}>
          <div class="column is-one-quarter">
            ${menu(sheets, activeSheet.name)}
          </div>
          <div class="column">
            ${activeSheet.fields !== null
              ? table(activeSheet.fields, activeSheet.rows)
              : ''}
          </div>
        </div>
      </div>
    </body>
  `

  function onload (el) {
    console.log('onload')
    emit('sheets:getList')
  }
}
