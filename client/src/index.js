const choo = require('choo')
const css = require('sheetify')
css('bulma/css/bulma.css')

const app = choo()
app.use(require('./models/sheet'))
app.route('/:sheet', require('./view'))
app.mount('body')
