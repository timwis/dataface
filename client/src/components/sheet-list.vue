<template>
  <aside class="menu">
    <p class="menu-label">
      Sheets
    </p>
    <ul class="menu-list">
      <li v-for="sheet in sheets">
        <router-link :to="'/sheets/' + sheet.name"
           :class="{ 'is-active': sheet.name === activeSheetName }">
          {{ sheet.name }}
          <button class="delete" @click.prevent.stop="removeSheet(sheet.name)"></button>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
const { mapState, mapActions } = require('vuex')

module.exports = {
  name: 'sheet-list',
  computed: mapState({
    sheets: (state) => state.db.sheets,
    activeSheetName: (state) => state.db.activeSheet.name
  }),
  methods: mapActions([
    'removeSheet'
  ])
}
</script>

<style scoped>
.delete {
  float: right;
  display: none;
}
.menu-list li:hover .delete {
  display: inline-block;
}
</style>
