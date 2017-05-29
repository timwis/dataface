<template>
  <aside class="menu">
    <p class="menu-label">
      Sheets
    </p>
    <ul class="menu-list">
      <li v-for="sheet in sheets">
        <router-link :to="'/' + sheet.name"
           :class="{ 'is-active': sheet.name === activeSheetName }">
          {{ sheet.name }}
          <button class="delete" @click.prevent="onClickDelete"></button>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
const { mapState } = require('vuex')

module.exports = {
  computed: mapState({
    sheets: (state) => state.db.sheets,
    activeSheetName: (state) => state.db.activeSheet.name
  }),
  methods: {
    onClickDelete (evt) {
      console.log('Clicked delete sheet')
    }
  }
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
