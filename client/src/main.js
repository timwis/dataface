const Vue = require('vue')

const layout = require('./pages/layout.vue')
const store = require('./store')
const router = require('./router')

new Vue({ // eslint-disable-line
  el: '#app',
  store,
  router,
  render: h => h(layout)
})
