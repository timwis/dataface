require('browser-env')()

const Vue = require('vue')
Vue.config.productionTip = false

const hooks = require('require-extension-hooks')
hooks('vue').plugin('vue').push()
