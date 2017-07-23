<template>
  <div>
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Dataface
          </h1>
          <h2 class="subtitle">
            Build and manage data in a Postgres database with a spreadsheet-like interface.
          </h2>
          <a :href="loginUrl" class="button is-primary is-inverted is-large">
            Get started by logging in
          </a>
        </div>
      </div>
    </section>

    <div class="container">
      <img id="screencast" src="img/screencast.gif">
    </div>
  </div>
</template>

<script>
const { mapState } = require('vuex')

const auth0Url = require('../helpers/auth0')

module.exports = {
  computed: {
    ...mapState({
      isAuthenticated: (state) => state.user.isAuthenticated
    }),
    loginUrl () {
      return (this.isAuthenticated) ? '/sheets' : auth0Url
    }
  }
}
</script>

<style>
#screencast {
  margin-top: 15px;
}
</style>
