<template>
  <div id="app">
    <site-nav></site-nav>
    <router-view class="router-view"></router-view>
  </div>
</template>

<script>
const { mapState, mapActions } = require('vuex')

const SiteNav = require('../components/site-nav.vue')

module.exports = {
  computed: mapState({
    sheets: (state) => state.db.sheets
  }),
  methods: {
    ...mapActions([
      'getSheetList',
      'getSheet'
    ]),
    getActiveSheet () {
      const route = this.$route.params.sheetName
      const activeSheetName = determineActiveSheet(route, this.sheets)
      this.getSheet({ name: activeSheetName })
    }
  },
  async created () {
    await this.getSheetList()
    this.getActiveSheet()
  },
  watch: {
    '$route': 'getActiveSheet'
  },
  components: {
    'site-nav': SiteNav
  }
}

function determineActiveSheet (route, sheets) {
  if (route) {
    return route
  } else if (sheets.length > 0) {
    return sheets[0].name
  } else {
    return ''
  }
}
</script>

<style>
@import url('../node_modules/bulma/css/bulma.css');

html,
body,
#app {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
}
.router-view {
  flex: 1;
}
</style>
