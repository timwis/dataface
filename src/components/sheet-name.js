const html = require('choo/html')

module.exports = function sheetName (title, onChange) {
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
    const oldName = title
    const name = evt.target.innerText
    if (oldName !== name && onChange) onChange(oldName, name)
  }
}
