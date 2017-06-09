const test = require('ava')
const { mount, mockStore } = require('vuenit')

const SheetName = require('../../src/components/sheet-name.vue')

test('renders sheet name', (t) => {
  const $store = mockStore({
    modules: {
      db: {
        activeSheet: { name: 'users' }
      }
    }
  })
  const vm = mount(SheetName, { inject: { $store } })
  const headerText = vm.$find('h1').textContent
  t.is(headerText, 'users')
})
