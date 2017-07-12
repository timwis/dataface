const Vue = require('vue')
const Vuex = require('vuex')

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    db: require('./modules/db'),
    ui: require('./modules/ui'),
    auth: require('./modules/auth')
  },
  strict: (process.env.NODE_ENV !== 'production')
})

module.exports = store
