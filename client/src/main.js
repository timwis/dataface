const Vue = require('vue')

const layout = require('./pages/layout.vue')
const store = require('./store')
const router = require('./router')

store.dispatch('getCurrentUser')
  .then(() => new Vue({
    el: '#app',
    store,
    router,
    render: h => h(layout)
  }))
