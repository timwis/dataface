<template>
  <div class="container">
    <div class="columns">
      <div class="column is-one-quarter">
        <sheet-list></sheet-list>
      </div>
      <div class="column grid-container">
        <grid></grid>
      </div>
    </div>
  </div>
</template>

<script>
const SiteNav = require('../components/site-nav.vue')
const SheetList = require('../components/sheet-list.vue')
const Grid = require('../components/grid.vue')

module.exports = {
  name: 'app',
  components: {
    'site-nav': SiteNav,
    'sheet-list': SheetList,
    'grid': Grid
  }
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
</style>
