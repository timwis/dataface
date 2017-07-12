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
const { mapState, mapMutations } = require('vuex')
const values = require('lodash/values')

const SiteNav = require('../components/site-nav.vue')
const Notification = require('../components/notification.vue')

module.exports = {
  name: 'Layout',
  computed: mapState({
    notifications: (state) => values(state.ui.notifications)
  }),
  methods: mapMutations([
    'dismissNotification'
  ]),
  components: {
    'site-nav': SiteNav,
    'notification': Notification
  }
}

</script>

<style src="../../../node_modules/bulma/css/bulma.css"></style>
<style>
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
