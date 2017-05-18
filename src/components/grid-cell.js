const onload = require('on-load')

const setCursor = require('../util').setCursor

module.exports = function gridCell (opts) {
  const tagName = opts.isHeader ? 'th' : 'td'
  const el = document.createElement(tagName)
  el.innerText = opts.value

  el.dataset.rowIndex = opts.rowIndex
  el.dataset.columnIndex = opts.columnIndex

  if (opts.isSelected) {
    el.classList.add('selected')
  }

  if (opts.isSelected && opts.isEditing) {
    el.classList.add('editing')
    el.setAttribute('contenteditable', true)
    onload(el, setCursorInSelectedCell)
  }

  return el
}

function setCursorInSelectedCell () {
  // Can't use the `el` arg passed because of dom morphing.
  // It's probably a bug with nanomorph, technically
  const el = document.querySelector('.selected')
  setCursor(el)
}
