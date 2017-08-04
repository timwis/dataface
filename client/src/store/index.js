const Vue = require('vue')
const Vuex = require('vuex')

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    db: require('./modules/db'),
    ui: require('./modules/ui'),
    user: require('./modules/user')
  },
  strict: (process.env.NODE_ENV !== 'production')
})

module.exports = store
