<template>
  <div class="notification" :class="contextClass">
    <button class="delete" @click.prevent="$emit('dismiss')"></button>
    {{ msg }}
  </div>
</template>

<script>
module.exports = {
  props: [ 'msg', 'type' ],
  computed: {
    contextClass () {
      return this.type ? `is-${this.type}` : ''
    }
  }
}
</script>

<style scoped>
.notification {
  position: absolute;
  top: 7px;
  left: 10%;
  right: 10%;
  z-index: 99999;
}
</style>
