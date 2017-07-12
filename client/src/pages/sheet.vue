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
const { mapActions, mapState } = require('vuex')

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
  computed: mapState({
    sheets: (state) => state.db.sheets,
  }),
  methods: {
    ...mapActions([
      'insertSheet',
      'getSheetList',
      'getSheet'
    ]),
    getActiveSheet () {
      const route = this.$route.params.sheetName
      const activeSheetName = determineActiveSheet(route, this.sheets)
      if (activeSheetName) this.getSheet({ name: activeSheetName })
    }
  },
  async created () {
    await this.getSheetList()
    this.getActiveSheet()
  },
  watch: {
    '$route': 'getActiveSheet'
  },
}

function determineActiveSheet (route, sheets) {
  if (route) {
    return route
  } else if (sheets.length > 0) {
    return sheets[0].name
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
.add-sheet-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
