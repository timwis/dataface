const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    width: 250px;
    position: absolute;
    z-index: 999;
    background-color: #fff;
    box-shadow: 0 2px 6px 0 #ccc;
  }
`
module.exports = function contextMenu (items, state, hideCb) {
  const el = html`
    <div class="${prefix} panel" onload=${onload} onunload=${onunload}>
    ${items.map((item) => html`
      <a class="panel-block" onclick=${item.onclick}>
        ${item.label}
      </a>
    `)}
    </div>
  `
  el.style.left = state.x + 'px'
  el.style.top = state.y + 'px'
  return el

  function onload (el) {
    document.addEventListener('click', hideCb)
  }
  function onunload (el) {
    document.removeEventListener('click', hideCb)
  }
}
