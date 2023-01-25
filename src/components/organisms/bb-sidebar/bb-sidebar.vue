<template>
  <div class="bb-sidebar">
    <BBSearch />
    <BBTree @node-selected="onPlaylistSelected" />
  </div>
</template>

<script lang="ts" setup>
import BBSearch from '../../molecules/bb-search/bb-search.vue';
import BBTree from '../../atoms/bb-tree/bb-tree.vue';

function onPlaylistSelected(value: unknown) {
  console.log('onPlaylistSelected', value)
}
</script>

<style lang="scss">
.bb-sidebar {
  width: 100%;
  height: 100%;
}
</style>
