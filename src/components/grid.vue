<template>
  <div>
    <table
      v-if="isDataLoaded"
      class="table is-bordered is-striped is-narrow"
      :class="{ editing: editing }"
      @click="onClickCell"
      @dblclick="onDblClickCell"
      @focus.capture="onFocus"
      @blur.capture="onBlur"
      @input="onInput"
      @keydown.enter.capture.prevent="onPressEnter"
      @keydown.esc.capture.prevent="onPressEscape"
      @keydown.up.capture="onPressArrowKeys('up', $event)"
      @keydown.down.capture="onPressArrowKeys('down', $event)"
      @keydown.left.capture="onPressArrowKeys('left', $event)"
      @keydown.right.capture="onPressArrowKeys('right', $event)">
      <thead @contextmenu.prevent="onColumnContextMenu">
        <tr>
          <th
            v-for="(column, columnIndex) in columns"
            tabindex="0"
            contenteditable
            :data-row-index="HEADER_ROW"
            :data-column-index="columnIndex"
            v-text="column.name"></th>
          <th class="extra-column" @click.stop="onClickAddColumn">+</th>
        </tr>
      </thead>
      <tbody @contextmenu.prevent="onRowContextMenu">
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td
            v-for="(column, columnIndex) in columns"
            tabindex="0"
            :contenteditable="(hasKeys && column.editable) ? true : false"
            :data-row-index="rowIndex"
            :data-column-index="columnIndex"
            v-text="row[column.name]"></td>
          <td class="extra-column"></td>
        </tr>
        <tr :key="rows.length" v-if="hasKeys">
          <td
            v-for="(column, columnIndex) in columns"
            tabindex="0"
            :contenteditable="column.editable ? true : false"
            :data-row-index="rows.length"
            :data-column-index="columnIndex">
          </td>
          <td class="extra-column"></td>
        </tr>
      </tbody>
    </table>

    <context-menu ref="rowMenu">
      <template scope="child">
        <div class="panel">
          <a class="panel-block" @click="removeRow(child.userData)">
            Remove row
          </a>
        </div>
      </template>
    </context-menu>

    <context-menu ref="columnMenu">
      <template scope="child">
        <div class="panel">
          <a class="panel-block" @click="removeColumn(child.userData)">
            Remove column
          </a>
        </div>
      </template>
    </context-menu>
  </div>
</template>

<script>
const { mapState, mapMutations, mapActions } = require('vuex')
const contextMenu = require('vue-lil-context-menu')

module.exports = {
  name: 'grid',
  components: {
    'context-menu': contextMenu
  },
  data () {
    return { HEADER_ROW: -1 }
  },
  computed: {
    classObject () {
      return { editing: this.editing }
    },
    isDataLoaded () {
      return this.columns.length > 0
    },
    ...mapState({
      columns: (state) => state.db.activeSheet.columns,
      rows: (state) => state.db.activeSheet.rows,
      hasKeys: (state) => state.db.activeSheet.keys.length > 0,
      editing: (state) => state.ui.editing
    })
  },
  methods: {
    ...mapMutations([
      'setEditing',
      'setNotEditing'
    ]),
    ...mapActions([
      'saveCell',
      'removeRow',
      'insertColumn',
      'renameColumn',
      'removeColumn'
    ]),
    onFocus (evt) {
      setCursor(evt.target)
    },
    onBlur (evt) {
      if (!this.editing) return
      this.setNotEditing()

      const el = evt.target
      const { rowIndex, columnIndex } = getElIndexes(el)

      if (rowIndex === this.HEADER_ROW) {
        const oldValue = this.getCurrentHeaderValue(columnIndex)
        const newValue = el.innerText
        if (oldValue !== newValue) {
          this.renameColumn({ columnIndex, oldValue, newValue })
        }
      } else {
        const oldValue = this.getCurrentCellValue(rowIndex, columnIndex)
        const newValue = el.innerText
        if (oldValue !== newValue) {
          this.saveCell({ rowIndex, columnIndex, newValue })
        }
      }
    },
    onInput (evt) {
      if (!this.editing) this.setEditing()
    },
    onPressEnter (evt) {
      const el = evt.target
      const isEditable = el.isContentEditable
      if (this.editing) {
        // navigating down triggers blur, which triggers setNotEditing
        this.navigate('down', evt.target)
        this.onBlur(evt) // HACK: if pressing enter on final row, navigate does nothing
      } else if (isEditable) {
        this.setEditing()
        setCursor(el, 'end')
      }
    },
    onPressEscape (evt) {
      const el = evt.target
      const { rowIndex, columnIndex } = getElIndexes(el)
      const oldValue = this.getCurrentCellValue(rowIndex, columnIndex)
      el.innerText = oldValue
      this.setNotEditing()
      setCursor(el)
    },
    onClickCell (evt) {
      const el = evt.target
      el.focus()
      setCursor(el)
    },
    onDblClickCell (evt) {
      const el = evt.target
      const isEditable = el.isContentEditable
      if (isEditable) {
        this.setEditing()
        el.focus()
        setCursor(el, 'end')
      }
    },
    onPressArrowKeys (direction, evt) {
      if (this.editing) return

      const el = evt.target
      this.navigate(direction, el)
      evt.preventDefault()
    },
    async onClickAddColumn (evt) {
      await this.insertColumn()
      const lastColumnEl = this.$el.querySelector('th:nth-last-child(2)')
      lastColumnEl.focus()
    },
    onRowContextMenu (evt) {
      const el = evt.target
      const { rowIndex } = getElIndexes(el)
      this.$refs.rowMenu.open(evt, rowIndex)
    },
    onColumnContextMenu (evt) {
      const el = evt.target
      const { columnIndex } = getElIndexes(el)
      this.$refs.columnMenu.open(evt, columnIndex)
    },
    navigate (direction, currentEl) {
      const { rowIndex, columnIndex } = getElIndexes(currentEl)
      let newEl

      switch (direction) {
        case 'up':
          let previousRow
          if (rowIndex === 0) {
            const tbody = currentEl.parentNode.parentNode
            const thead = tbody.previousElementSibling
            previousRow = thead.children[0]
          } else {
            previousRow = currentEl.parentNode.previousElementSibling
          }
          if (previousRow) {
            newEl = previousRow.children[columnIndex]
          }
          break
        case 'down':
          let nextRow
          if (rowIndex === this.HEADER_ROW) {
            const thead = currentEl.parentNode.parentNode
            const tbody = thead.nextElementSibling
            nextRow = tbody.children[0]
          } else {
            nextRow = currentEl.parentNode.nextElementSibling
          }
          if (nextRow) {
            newEl = nextRow.children[columnIndex]
          }
          break
        case 'left':
          newEl = currentEl.previousSibling
          break
        case 'right':
          newEl = currentEl.nextElementSibling
          break
      }
      if (newEl) newEl.focus()
    },
    getCurrentHeaderValue (columnIndex) {
      // always return string for comparison
      return this.columns[columnIndex].name + ''
    },
    getCurrentCellValue (rowIndex, columnIndex) {
      const row = this.rows[rowIndex]
      const column = this.columns[columnIndex]
      if (row && column) {
        // always return string for comparison
        return row[column.name] + ''
      } else {
        return null
      }
    }
  }
}
function getElIndexes (el) {
  const rowIndex = numericAttribute(el.getAttribute('data-row-index'))
  const columnIndex = numericAttribute(el.getAttribute('data-column-index'))
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
th:not(.extra-column),
td:not(.extra-column) {
  cursor: cell;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
th.extra-column {
  cursor: pointer;
  text-align: center;
}
th.extra-column,
td.extra-column {
  width: 35px;
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
.lil-context-menu {
  width: 250px;
  background-color: #fff;
  box-shadow: 0 2px 6px 0 #ccc;
}
</style>
