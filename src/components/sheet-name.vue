<template>
  <h1 class="title sheet-name"
      contenteditable
      @keydown.enter.prevent="$el.blur()"
      @blur="onSave"
      v-text="sheetName"></h1>
</template>

<script>
const { mapState, mapActions } = require('vuex')

module.exports = {
  computed: mapState({
    sheetName: (state) => state.db.activeSheet.name
  }),
  methods: {
    onSave (evt) {
      const oldName = this.sheetName
      const newName = evt.target.innerText
      if (oldName !== newName) {
        this.renameSheet({ oldName, newName })
      }
    },
    ...mapActions([
      'renameSheet'
    ])
  }
}
</script>

<style scoped>
.sheet-name {
  cursor: text;
  outline: none;
}
.sheet-name:hover {
  background-color: #ffdd57;
}
</style>
