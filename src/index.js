const choo = require('choo')
const css = require('sheetify')
css('bulma/css/bulma.css')

const layout = require('./views/layout')
const grid = require('./views/grid2')

const app = choo()
app.use(require('./models/store'))
app.use(require('./models/ui'))

const isDebug = process.env.NODE_ENV !== 'production'
if (isDebug) app.use(require('choo-log')())

app.route('/:sheet', layout(grid))
app.mount('body')
