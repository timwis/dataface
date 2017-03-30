const choo = require('choo')
const css = require('sheetify')
css('bulma/css/bulma.css')

const app = choo()
app.use(require('./models/sheet'))
app.use(require('./models/table'))
app.route('/:sheet', require('./view'))
app.mount('body')
