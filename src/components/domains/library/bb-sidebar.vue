<template>
  <div class="bb-sidebar">
    <BBSearch />
    <BBPlaylistCreate />
    <BBTree :key="globalStore.refreshSidebarKey" />
  </div>
</template>

<script lang="ts" setup>
import BBTree from 'src/components/domains/library/tree/bb-tree.vue'
import BBSearch from 'src/components/domains/header/search/bb-search.vue'
import BBPlaylistCreate from 'src/components/domains/playlists/create/bb-playlist-create.vue'
import { useGlobalStore } from 'src/stores/global.store'

const globalStore = useGlobalStore()
</script>

<style lang="scss">
.bb-sidebar {
  width: 100%;
  height: 100%;
}
</style>
