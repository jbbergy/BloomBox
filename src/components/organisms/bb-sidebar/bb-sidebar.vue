<template>
  <div class="bb-sidebar">
    <BBSearch />
    <BBPlaylistCreate />
    <BBTree />
  </div>
</template>

<script lang="ts" setup>
import BBSearch from '../../molecules/bb-search/bb-search.vue';
import BBTree from '../../atoms/bb-tree/bb-tree.vue';
import BBPlaylistCreate from '../../molecules/bb-playilist-create/bb-playlist-create.vue'
</script>

<style lang="scss">
.bb-sidebar {
  width: 100%;
  height: 100%;
}
</style>
