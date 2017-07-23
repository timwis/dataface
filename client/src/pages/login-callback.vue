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
  async created () {
    const authCode = this.$route.query.code
    await this.finishLogin(authCode)
    this.$router.push('/sheets')
  }
}
</script>
