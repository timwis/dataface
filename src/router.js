const Vue = require('vue')
const VueRouter = require('vue-router')

const Sheet = require('./pages/sheet.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Sheet },
  { path: '/:sheetName', component: Sheet }
]

module.exports = new VueRouter({
  mode: 'history',
  routes
})
