module.exports = {
  state: {
    editing: false
  },
  mutations: {
    setEditing (state) {
      state.editing = true
    },
    setNotEditing (state) {
      state.editing = false
    }
  }
}
