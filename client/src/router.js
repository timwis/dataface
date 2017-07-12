const Vue = require('vue')
const VueRouter = require('vue-router')

const Sheet = require('./pages/sheet.vue')
const LoginCallback = require('./pages/login-callback.vue')
const { initiateLogin } = require('./helpers/auth0')

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Sheet, beforeEnter: auth },
  { path: '/login', beforeEnter: initiateLogin },
  { path: '/login/callback', component: LoginCallback },
  { path: '/sheets/:sheetName', component: Sheet, beforeEnter: auth }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

module.exports = router

function auth (to, from, next) {
  const store = router.app.$store
  if (!store.state.user.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}
