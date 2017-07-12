const api = require('../../api')

module.exports = {
  state: {
    isAuthenticated: false,
    displayName: null,
    nickname: null,
    picture: null
  },
  mutations: {
    receiveUser (state, user) {
      state.isAuthenticated = true
      state.displayName = user.displayName
      state.nickname = user.nickname
      state.picture = user.picture
    }
  },
  actions: {
    async finishLogin ({ commit, dispatch }, authCode) {
      try {
        const user = await api.authenticate(authCode)
        commit('receiveUser', user)
      } catch (err) {
        console.error(err)
        dispatch('notify', { msg: `Login failed` })
      }
    },
    async getCurrentUser ({ commit }) {
      try {
        const user = await api.getCurrentUser()
        commit('receiveUser', user)
      } catch (err) {
        console.log('Not logged in')
      }
    }
  }
}
