const test = require('ava')
const { mount, mockStore } = require('vuenit')

const SheetList = require('../../../client/src/components/sheet-list.vue')

test('renders list items', (t) => {
  const $store = mockStore({
    modules: {
      db: {
        sheets: [ { name: 'Foo' }, { name: 'Bar' } ],
        activeSheet: {}
      }
    }
  })
  const vm = mount(SheetList, { inject: { $store } })
  const listItems = vm.$find('ul.menu-list li')
  t.is(listItems.length, 2)

  const itemText = listItems[1].textContent.trim()
  t.is(itemText, 'Bar')
})

test.cb('clicking delete calls removeSheet action with sheet name', (t) => {
  const $store = mockStore({
    modules: {
      db: {
        sheets: [ { name: 'Foo' } ],
        activeSheet: {}
      }
    }
  })
  $store.when('removeSheet').call((context, payload) => {
    t.is(payload, 'Foo')
    t.end()
  })
  const vm = mount(SheetList, { inject: { $store } })
  const button = vm.$findOne('ul.menu-list li .delete')
  button.click()
})
