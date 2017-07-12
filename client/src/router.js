const Vue = require('vue')
const VueRouter = require('vue-router')

const Sheet = require('./pages/sheet.vue')
const LoginCallback = require('./pages/login-callback.vue')
const { initiateLogin } = require('./helpers/auth0')

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Sheet },
  { path: '/login', beforeEnter: initiateLogin },
  { path: '/login/callback', component: LoginCallback },
  { path: '/sheets/:sheetName', component: Sheet }
]

module.exports = new VueRouter({
  mode: 'history',
  routes
})
