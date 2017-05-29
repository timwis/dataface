const Vue = require('vue')
const Vuex = require('vuex')

Vue.use(Vuex)

module.exports = new Vuex.Store({
  modules: {
    db: require('./modules/db')
  },
  strict: (process.env.NODE_ENV !== 'production')
})
