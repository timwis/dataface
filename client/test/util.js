const Vue = require('vue')

exports.mount = function mount (Component, propsData) {
  const Ctor = Vue.extend(Component)
  return new Ctor({ propsData }).$mount()
}
