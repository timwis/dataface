const choo = require('choo')
const css = require('sheetify')
css('bulma/css/bulma.css')

const app = choo()
app.use(require('./models/sheet'))
app.use(require('./models/table'))

const isDebug = process.env.NODE_ENV !== 'production'
if (isDebug) app.use(require('choo-log')())

app.route('/:sheet', require('./view'))
app.mount('body')
