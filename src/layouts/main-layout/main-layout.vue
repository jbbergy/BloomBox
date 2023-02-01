<template>

  <div v-if="showDebug" class="data-debug">
    playQueueStore<br>
    playQueueStore.queue : {{ playQueueStore.queue?.length }}<br>
    playQueueStore.selectedFile : {{ playQueueStore.selectedFile?.label }}<br>
    playQueueStore.playingFile :{{ playQueueStore.playingFile?.label }}<br>
    <br>
    playlistsStore<br>
    playlistsStore.playlists : {{ playlistsStore.playlists?.length }}<br>
    playlistsStore.selectedPlaylist : {{ playlistsStore.selectedPlaylist?.label }}<br>
    <br>
    playerStore<br>
    playerStore.currentInstance : {{ !!playerStore.currentInstance }}<br>
    playerStore.defaultVolume : {{ playerStore.defaultVolume }}<br>
    <br>
  </div>
  <q-layout view="hHh lpR lFf">

    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          BloomBox
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left">
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
import { usePlayQueueStore } from '../../stores/play-queue.store';
import { usePlaylistsStore } from '../../stores/playlists.store';
import { usePlayerStore } from '../../stores/player.store';

import BBSidebar from '../../components/organisms/bb-sidebar/bb-sidebar.vue'
import BBPlayer from '../../components/organisms/bb-player/bb-player.vue'
import { ref } from 'vue'

const showDebug = ref(true)

const playQueueStore = usePlayQueueStore()
const playlistsStore = usePlaylistsStore()
const playerStore = usePlayerStore()
const leftDrawerOpen = ref(true)
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
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 2100;
}
</style>
