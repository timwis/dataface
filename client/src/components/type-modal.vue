<template>
  <div
    v-if="isActive"
    class="modal is-active">
    <div class="modal-background"></div>
    <div
      class="modal-card"
      ref="card"
      tabindex="-1"
      @blur="close">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Change column type:
          <strong>{{ column.name }}</strong>
        </p>
        <button class="delete"></button>
      </header>
      <section class="modal-card-body">
        <aside class="menu">
          <ul class="menu-list">
            <li v-for="type in types">
              <a
                class="{'is-active': selection === type.key}"
                @click.prevent="select(type.key)"
                v-text="type.label"></a>
            </li>
          </ul>
        </aside>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-success">Save changes</a>
        <a class="button">Cancel</a>
      </footer>
    </div>
  </div>
</template>

<script>
const Vue = require('vue')

const types = [
  {
    key: 'short_text',
    label: 'Short text'
  },
  {
    key: 'long_text',
    label: 'Paragraph(s)'
  }
]

module.exports = {
  data () {
    return {
      column: null,
      selection: null,
      types
    }
  },
  computed: {
    isActive () {
      return (this.column !== null)
    }
  },
  methods: {
    open (column) {
      this.column = column
      this.selection = column.type
      Vue.nextTick(() => {
        this.$refs.card.focus()
      })
    },
    close (evt) {
      this.column = null
      this.selection = null
    },
    select (type) {
      this.selection = type
    }
  }
}
</script>

<style scoped>
.modal-card:focus {
  outline: none;
}
</style>
