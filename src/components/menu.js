const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  .delete {
    float: right;
    display: none;
  }
  .menu-list li:hover .delete {
    display: inline-block;
  }
`

module.exports = function menu (sheets, activeSheet, onDelete) {
  return html`
    <aside class="menu ${prefix}">
      <p class="menu-label">Sheets</p>
      <ul class="menu-list">
      ${sheets.map(menuItem)}
      </ul>
    </aside>
  `

  function menuItem (item) {
    const classes = item.name === activeSheet ? 'is-active' : ''

    return html`
      <li>
        <a class=${classes} href="/${item.name}">
          ${item.name}
          <button class="delete" onclick=${onClickDelete}></button>
        </a>
      </li>
    `

    function onClickDelete (evt) {
      if (onDelete) onDelete(item.name)
      evt.preventDefault()
      evt.stopPropagation()
    }
  }
}
