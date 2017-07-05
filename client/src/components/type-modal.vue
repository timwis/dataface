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
        <div class="columns">
          <div class="column is-one-third">
            <aside class="menu">
              <ul class="menu-list">
                <li v-for="type in types">
                  <a
                    :class="{'is-active': selection === type.key}"
                    @click.prevent="select(type.key)"
                    v-text="type.label"></a>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a @click="save" class="button is-primary">Save changes</a>
        <a @click="close" class="button">Cancel</a>
      </footer>
    </div>
  </div>
</template>

<script>
const Vue = require('vue')
const { mapActions } = require('vuex')

const types = [
  { key: 'text', label: 'Text' },
  { key: 'number', label: 'Number' },
  { key: 'checkbox', label: 'Checkbox' }
]

module.exports = {
  data () {
    return {
      columnIndex: null,
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
    ...mapActions([
      'setColumnType'
    ]),
    open (columnIndex, column) {
      this.columnIndex = columnIndex
      this.column = column
      this.selection = column.type
      Vue.nextTick(() => {
        this.$refs.card.focus()
      })
    },
    close (evt) {
      this.columnIndex = null
      this.column = null
      this.selection = null
    },
    select (type) {
      this.selection = type
    },
    save () {
      if (this.selection !== this.column.type) {
        const columnIndex = this.columnIndex
        const type = this.selection
        this.setColumnType({ columnIndex, type })
      }
      this.close()
    }
  }
}
</script>

<style scoped>
.modal-card:focus {
  outline: none;
}
</style>
