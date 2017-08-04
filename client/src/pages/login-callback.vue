<template>
  <div class="container">
    Loading...
  </div>
</template>

<script>
const { mapState, mapActions } = require('vuex')

module.exports = {
  computed: mapState({
    isAuthenticated: (state) => state.user.isAuthenticated
  }),
  methods: mapActions([
    'finishLogin'
  ]),
  async created () {
    const authCode = this.$route.query.code
    await this.finishLogin(authCode)
    if (this.isAuthenticated) this.$router.push('/sheets')
  }
}
</script>
