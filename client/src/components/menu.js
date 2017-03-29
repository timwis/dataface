const html = require('choo/html')

module.exports = function menu (sheets, activeSheet) {
  return html`
    <aside class="menu">
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
        </a>
      </li>
    `
  }
}


