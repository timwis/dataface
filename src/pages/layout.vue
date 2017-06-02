<template>
  <div id="app">
    <site-nav></site-nav>
    <notification
       v-for="item in notifications"
       :msg="item.msg"
       :type="item.type"
       @dismiss="dismissNotification(item.id)"></notification>
    <router-view class="router-view"></router-view>
  </div>
</template>

<script>
const { mapState, mapActions, mapMutations } = require('vuex')
const values = require('lodash/values')

const SiteNav = require('../components/site-nav.vue')
const Notification = require('../components/notification.vue')

module.exports = {
  name: 'Layout',
  computed: mapState({
    sheets: (state) => state.db.sheets,
    notifications: (state) => values(state.ui.notifications)
  }),
  methods: {
    ...mapActions([
      'getSheetList',
      'getSheet'
    ]),
    ...mapMutations([
      'dismissNotification'
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
    'site-nav': SiteNav,
    'notification': Notification
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
