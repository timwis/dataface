const shortid = require('shortid')

const HEADER_INDEX = -1

module.exports = function ui (state, emitter) {
  state.ui = {
    selectedCell: {
      rowIndex: null,
      columnIndex: null,
      editing: false,
      pendingValue: null
    },
    headerMenu: {
      x: 0,
      y: 0,
      columnIndex: null,
      visible: false
    },
    rowMenu: {
      x: 0,
      y: 0,
      rowIndex: null,
      visible: false
    },
    notifications: []
  }

  emitter.on('ui:navigate', ({ direction, rowCount, columnCount }) => {
    const currentRowIndex = state.ui.selectedCell.rowIndex
    const currentColumnIndex = state.ui.selectedCell.columnIndex
    const payload = {}

    switch (direction) {
      case 'up':
        const prevRowIndex = currentRowIndex - 1
        payload.rowIndex = Math.max(prevRowIndex, HEADER_INDEX)
        break
      case 'down':
        const nextRowIndex = currentRowIndex + 1
        const lastRowIndex = rowCount // includes one for empty row
        payload.rowIndex = Math.min(nextRowIndex, lastRowIndex)
        break
      case 'left':
        const prevColumnIndex = currentColumnIndex - 1
        payload.columnIndex = Math.max(prevColumnIndex, 0)
        break
      case 'right':
        const nextColumnIndex = currentColumnIndex + 1
        const lastColumnIndex = columnCount - 1
        payload.columnIndex = Math.min(nextColumnIndex, lastColumnIndex)
        break
    }
    emitter.emit('ui:selectCell', payload)
  })

  emitter.on('ui:selectCell', ({ rowIndex, columnIndex }) => {
    Object.assign(state.ui.selectedCell, { rowIndex, columnIndex })
    state.ui.selectedCell.editing = false
    state.ui.selectedCell.pendingValue = null
    emitter.emit('render')
  })

  emitter.on('ui:setCellEditing', () => {
    state.ui.selectedCell.editing = true
    emitter.emit('render')
  })

  emitter.on('ui:setCellNotEditing', () => {
    state.ui.selectedCell.editing = false
    emitter.emit('render')
  })

  emitter.on('ui:setPendingValue', (value) => {
    state.ui.selectedCell.pendingValue = value
  })

  emitter.on('ui:headerMenu', ({ x, y, columnIndex, visible }) => {
    state.ui.headerMenu = { x, y, columnIndex, visible }
    emitter.emit('render')
  })

  emitter.on('ui:rowMenu', ({ x, y, rowIndex, visible }) => {
    state.ui.rowMenu = { x, y, rowIndex, visible }
    emitter.emit('render')
  })

  emitter.on('ui:notify', ({ msg, type = 'danger', duration = 5000 }) => {
    const id = shortid.generate()
    state.ui.notifications.push({ msg, type, id })
    window.setTimeout(() => emitter.emit('ui:dismissNotification', id), duration)
    emitter.emit('render')
  })

  emitter.on('ui:dismissNotification', (id) => {
    const index = state.ui.notifications.findIndex((item) => item.id === id)
    if (index !== -1) {
      state.ui.notifications.splice(index, 1)
      emitter.emit('render')
    }
  })
}
