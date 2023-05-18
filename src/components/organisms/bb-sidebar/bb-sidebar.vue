<template>
  <div class="bb-sidebar">
    <BBSearch />
    <BBPlaylistCreate />
    <BBTree :key="globalStore.refreshSidebarKey" />
  </div>
</template>

<script lang="ts" setup>
import BBTree from '../../molecules/bb-tree/bb-tree.vue'
import BBSearch from '../../molecules/bb-search/bb-search.vue'
import BBPlaylistCreate from '../../molecules/bb-playilist-create/bb-playlist-create.vue'
import { useGlobalStore } from '../../../stores/global.store'

const globalStore = useGlobalStore()
</script>

<style lang="scss">
.bb-sidebar {
  width: 100%;
  height: 100%;
}
</style>
