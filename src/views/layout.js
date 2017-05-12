const html = require('choo/html')

const nav = require('../components/nav')
const menu = require('../components/menu')
const notification = require('../components/notification')

require('insert-css')(`
  html, body, .container, .columns, .table-container {
    height: 100%
  }
  body {
    display: flex;
    flex-direction: column;
  }
  .table-container {
    overflow-x: auto;
  }
`)

module.exports = (view) => (state, emit) => {
  const { sheets, activeSheet } = state.store

  return html`
    <body>
      ${nav()}
      ${state.ui.notifications.map(createNotification)}
      <div class="container">
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

  function createNotification (item) {
    const onDismiss = () => emit('ui:dismissNotification', item.id)
    return notification(item.msg, item.type, onDismiss)
  }
}
