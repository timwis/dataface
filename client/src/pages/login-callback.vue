<template>
  <div class="container">
    Loading...
  </div>
</template>

<script>
const { mapActions } = require('vuex')

module.exports = {
  methods: mapActions([
    'finishLogin'
  ]),
  created () {
    const authCode = this.$route.query.code
    this.finishLogin(authCode)
  }
}
</script>
