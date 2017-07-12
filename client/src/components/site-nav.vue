<template>
  <nav class="nav has-shadow">
    <div class="container">
      <div class="nav-left">
        <a class="nav-item" href="/">
          Dataface
        </a>
      </div>
      <div class="nav-right nav-menu">
        <li v-if="isAuthenticated" class="nav-item">
          {{ nickname }}
        </li>
        <a v-else class="nav-item" href="/login">
          Login
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
const { mapState } = require('vuex')

module.exports = {
  computed: mapState({
    isAuthenticated: (state) => state.user.isAuthenticated,
    nickname: (state) => state.user.nickname
  })
}
</script>

<style scoped>
nav {
  margin-bottom: 15px;
}
</style>
