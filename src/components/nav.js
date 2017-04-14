const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    margin-bottom: 15px;
  }
`

module.exports = function nav () {
  return html`
    <nav class="nav has-shadow ${prefix}">
      <div class="container">
        <div class="nav-left">
          <a class="nav-item">
            Dataface
          </a>
        </div>
      </div>
    </nav>
  `
}
