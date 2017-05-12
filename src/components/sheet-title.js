const html = require('choo/html')

module.exports = function sheetTitle (title, onChange) {
  return html`
    <h1 class="title sheet-name"
      contenteditable="true"
      onkeydown=${onKeyDown}
      onblur=${onBlur}>
      ${title}
    </h1>
  `

  function onKeyDown (evt) {
    if (evt.which === 13) {
      evt.target.blur()
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

  function onBlur (evt) {
    const payload = { oldName: title, name: evt.target.innerText }
    if (onChange) onChange(payload)
  }
}
