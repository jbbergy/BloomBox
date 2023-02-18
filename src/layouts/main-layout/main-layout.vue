<template>

  <div v-if="showDebug" class="data-debug">
    <button @click="showDebug = false">Close</button>
    <pre>
      {{ playlistsStore.playlists?.find(p => p.label === 'Corc') }}<br>
      <br>
    </pre>
  </div>
  <q-layout view="hHh lpR lFf">

    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <BBHeader />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" class="custom-scrollbar">
      <BBSidebar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <BBPlayer />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script lang="ts" setup>
import { usePlaylistsStore } from '../../stores/playlists.store'
import BBHeader from '../../components/organisms/bb-header/bb-header.vue'
import BBSidebar from '../../components/organisms/bb-sidebar/bb-sidebar.vue'
import BBPlayer from '../../components/organisms/bb-player/bb-player.vue'
import { ref, watch } from 'vue'

const showDebug = ref(false)

const playlistsStore = usePlaylistsStore()
const leftDrawerOpen = ref(true)

watch(leftDrawerOpen, () => {
  if (!leftDrawerOpen.value) leftDrawerOpen.value = true
})

</script>

<style lang="scss">
.data-debug {
  position: fixed;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 400px;
  z-index: 2100;
  pointer-events: none;
  opacity: 0.5;

  button {
    pointer-events: all;
  }
}
</style>
