<template>
    <table
      class="table is-bordered is-striped is-narrow"
      :class="{ editing: editing }"
      @click="onClickCell"
      @dblclick="onDblClickCell"
      @focus.capture="onFocus"
      @blur.capture="onBlur"
      @input="onInput"
      @keydown.enter.prevent="onPressEnter"
      @keydown.up="navigate('up', $event)"
      @keydown.down="navigate('down', $event)"
      @keydown.left="navigate('left', $event)"
      @keydown.right="navigate('right', $event)">
      <thead>
        <tr>
          <th
            v-for="(column, columnIndex) in columns"
            data-row-index="-1"
            :data-column-index="columnIndex">
            {{ column.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="index">
          <td
            v-for="(column, columnIndex) in columns"
            tabindex="0"
            contenteditable
            :data-row-index="rowIndex"
            :data-column-index="columnIndex">
            {{ row[column.name] }}
          </td>
        </tr>
      </tbody>
    </table>
</template>

<script>
const { mapState, mapMutations } = require('vuex')

module.exports = {
  computed: {
    classObject () {
      return { editing: this.editing }
    },
    ...mapState({
      columns: (state) => state.db.activeSheet.columns,
      rows: (state) => state.db.activeSheet.rows,
      editing: (state) => state.ui.editing
    })
  },
  methods: {
    onFocus (evt) {
      setCursor(evt.target)
    },
    onBlur (evt) {
      if (this.editing) this.setNotEditing()
    },
    onInput (evt) {
      if (!this.editing) this.setEditing()
    },
    onPressEnter (evt) {
      const el = evt.target
      if (this.editing) {
        this.setNotEditing()
        this.navigate('down', evt)
        //setCursor(el)
      } else {
        this.setEditing()
        setCursor(el, 'end')
      }
    },
    onClickCell (evt) {
      const el = evt.target
      el.focus()
      setCursor(el)
    },
    onDblClickCell (evt) {
      console.log('dblclick')
      const el = evt.target
      this.setEditing()
      el.focus()
      setCursor(el, 'end')
    },
    navigate (direction, evt) {
      if (this.editing) return

      const currentEl = evt.target
      const { rowIndex, columnIndex } = getElIndexes(currentEl)
      let newEl

      switch (direction) {
        case 'up':
          const previousRow = currentEl.parentNode.previousSibling
          if (previousRow) {
            newEl = previousRow.children[columnIndex]
          }
          break
        case 'down':
          const nextRow = currentEl.parentNode.nextSibling
          if (nextRow) {
            newEl = nextRow.children[columnIndex]
          }
          break
        case 'left':
          newEl = currentEl.previousSibling
          break
        case 'right':
          newEl = currentEl.nextSibling
          break
      }
      if (newEl) newEl.focus()
      evt.preventDefault()
    },
    ...mapMutations([
      'setEditing',
      'setNotEditing'
    ])
  }
}
function getElIndexes (el) {
  const rowIndex = numericAttribute(el.dataset.rowIndex)
  const columnIndex = numericAttribute(el.dataset.columnIndex)
  return { rowIndex, columnIndex }
}
function numericAttribute (val) {
  return (val === '' || val === undefined) ? null : +val
}
function setCursor (el, position) {
  // http://stackoverflow.com/a/4238971/633406
  const range = document.createRange()
  range.selectNodeContents(el)
  if (position === 'end') {
    range.collapse(false) // end of text
  }
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}
</script>

<style scoped>
table {
  height: 500px;
  width: 100%;
  display: block;
  user-select: none;
}
thead,
tbody tr {
  width: 100%;
  display: table;
  table-layout: fixed;
}
tbody {
  height: 100%;
  display: block;
  overflow: auto;
}
th,
td {
  cursor: cell;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
table.editing th:focus,
table.editing td:focus {
  white-space: inherit;
  overflow: inherit;
  text-overflow: inherit;
}
table:not(.editing) th::selection,
table:not(.editing) td::selection {
  background: none;
}
th:focus,
td:focus {
  box-sizing: border-box;
  position: relative;
  box-shadow: none;
  outline: none;
}
th:focus::before,
td:focus::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px #00d1b2 solid;
}
table.editing th:focus,
table.editing td:focus {
  cursor: text;
  outline: none;
  background-color: #fff;
  box-shadow: 0 0 5px 3px #ccc;
  z-index: 999;
}
</style>
