const Vue = require('vue')
const shortid = require('shortid')

module.exports = {
  state: {
    editing: false,
    notifications: {}
  },
  mutations: {
    setEditing (state) {
      state.editing = true
    },
    setNotEditing (state) {
      state.editing = false
    },
    createNotification (state, { msg, type, id }) {
      Vue.set(state.notifications, id, { msg, type, id })
    },
    dismissNotification (state, id) {
      Vue.delete(state.notifications, id)
    }
  },
  actions: {
    notify ({ state, commit }, { msg, type = 'danger', duration = 5000 }) {
      const id = shortid.generate()
      commit('createNotification', { msg, type, id })
      window.setTimeout(() => commit('dismissNotification', id), duration)
    }
  }
}
