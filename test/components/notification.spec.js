const test = require('ava')

const { mount } = require('../util')
const Notification = require('../../src/components/notification.vue')

test('displays message', (t) => {
  const vm = mount(Notification, { msg: 'Foo' })
  const text = vm.$el.textContent.trim()
  t.is(text, 'Foo')
})

test('sets class based on type', (t) => {
  const vm = mount(Notification, { type: 'warning' })
  t.true(vm.$el.classList.contains('is-warning'))
})

test('clicking delete triggers dismiss event', (t) => {
  const vm = mount(Notification)
  vm.$on('dismiss', () => t.pass())
  const button = vm.$el.querySelector('button.delete')
  button.click()
})
