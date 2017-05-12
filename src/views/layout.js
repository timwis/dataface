const html = require('choo/html')

const nav = require('../components/nav')
const menu = require('../components/menu')
const notification = require('../components/notification')
const sheetTitle = require('../components/sheet-title')

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
  .add-sheet-btn {
    width: 100%;
  }
  .sheet-name {
    cursor: text;
    outline: none;
  }
  .sheet-name:hover {
    background-color: #ffdd57;
  }
`)

module.exports = (view) => (state, emit) => {
  const { sheets, activeSheet } = state.store

  return html`
    <body>
      ${nav()}
      <div class="notifications">
        ${state.ui.notifications.map(createNotification)}
      </div>
      <div class="container" onload=${onload}>
        <div class="columns">
          <div class="column is-one-quarter">
            ${menu(sheets, state.store.activeSheet.name, onClickDelete)}
            <a class="button add-sheet-btn" onclick=${onClickAdd}>
              Add sheet
            </a>
          </div>
          <div class="column table-container">
            ${activeSheet.name ? sheetTitle(activeSheet.name, onChangeTitle) : ''}
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

  function onClickDelete (sheetName) {
    emit('store:deleteSheet', sheetName)
  }

  function onClickAdd (evt) {
    emit('store:insertSheet')
  }

  function onChangeTitle (payload) {
    emit('store:renameSheet', payload)
  }
}
