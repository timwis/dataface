<template>
  <div class="container">
    Loading...
  </div>
</template>

<script>
const { mapActions } = require('vuex')

module.exports = {
  methods: mapActions([
    'logout'
  ]),
  async created () {
    await this.logout()
    this.$router.push('/')
  }
}
</script>
