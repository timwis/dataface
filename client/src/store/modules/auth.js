const api = require('../../api')

module.exports = {
  state: {
    isAuthenticated: false
  },
  actions: {
    async finishLogin ({ commit }, authCode) {
      const user = await api.authenticate(authCode)
      console.log(user)
    }
  }
}
