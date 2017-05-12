const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    position: absolute;
    top: 7px;
    left: 10%;
    right: 10%;
    z-index: 99999;
  }
`
/**
 * Creates an alert component
 * @param {string} msg Message to display
 * @param {string} [type] Bulma context class [primary|info|success|warning|danger]
 * @callback [onDismiss] Function to call when notification is dismissed
 */
module.exports = (msg, type, onDismiss) => {
  const contextClass = type ? `is-${type}` : ''
  const dismissBtn = onDismiss ? html`
    <button class="delete" onclick=${onDismiss}></button>
  ` : ''

  return html`
    <div class="${prefix} notification ${contextClass}">
      ${dismissBtn}
      ${msg}
    </div>
  `
}
