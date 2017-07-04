<template>
  <div class="container">
    <div class="columns">
      <div class="column is-one-quarter">
        <sheet-list></sheet-list>
        <a class="button add-sheet-btn" @click="insertSheet">
          Add sheet
        </a>
      </div>
      <div class="column grid-container">
        <sheet-name></sheet-name>
        <grid></grid>
      </div>
    </div>
  </div>
</template>

<script>
const { mapActions } = require('vuex')

const SiteNav = require('../components/site-nav.vue')
const SheetList = require('../components/sheet-list.vue')
const SheetName = require('../components/sheet-name.vue')
const Grid = require('../components/grid.vue')

module.exports = {
  name: 'app',
  components: {
    'site-nav': SiteNav,
    'sheet-list': SheetList,
    'sheet-name': SheetName,
    'grid': Grid
  },
  methods: mapActions([
    'insertSheet'
  ])
}
</script>

<style scoped>
.columns,
.column {
  height: 100%;
}
.grid-container {
  position: relative;
}
.add-sheet-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
