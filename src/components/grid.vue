<template>
  <div class="wrapper">
    <virtual-scroller
      class="scroller"
      :items="rows"
      item-height="34"
      container-tag="table"
      container-class="table is-bordered is-striped is-narrow"
      content-tag="tbody">
      <thead slot="before-content">
        <tr>
          <th v-for="column in columns">{{ column.name }}</th>
        </tr>
      </thead>
      <template scope="props">
        <tr :key="props.itemKey" class="item">
          <td v-for="column in columns">
            {{ props.item[column.name] }}
          </td>
        </tr>
      </template>
    </virtual-scroller>
  </div>
</template>

<script>
const { mapState } = require('vuex')
const { VirtualScroller } = require('vue-virtual-scroller')

module.exports = {
  computed: mapState({
    columns: (state) => state.db.activeSheet.columns,
    rows: (state) => state.db.activeSheet.rows
  }),
  components: {
    'virtual-scroller': VirtualScroller
  }
}
</script>

<style scoped>
.wrapper {
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.scroller {
  border: 1px red solid;
}
.item {
  height: 34px;
}
</style>
