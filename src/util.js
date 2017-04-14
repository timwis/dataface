module.exports.setCursor = function setCursor (el) {
  // http://stackoverflow.com/a/4238971/633406
  el.focus()
  if ('getSelection' in window && 'createRange' in document) {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false) // end of text
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  } else if ('createTextRange' in document.body) {
    const textRange = document.body.createTextRange()
    textRange.moveToElementText(el)
    textRange.collapse(false) // end of text
    textRange.select()
  }
}
