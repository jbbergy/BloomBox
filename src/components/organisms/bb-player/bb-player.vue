<template>
  <div class="bb-player">
    <div class="bb-player__left">
      {{ playlistsStore.selectedFile }}
    </div>
    <div class="bb-player__middle">
      <div class="bb-player__transport">
        <button @click="onPlayFile">Play</button>
      </div>
      <div class="bb-player__seek"></div>
    </div>
    <div class="bb-player__right"></div>
  </div>
</template>

<script lang="ts" setup>
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { usePlayerStore } from '../../../stores/player.store'

const playlistsStore = usePlaylistsStore()
const playerStore = usePlayerStore()

const onPlayFile = () => {
  if (!playlistsStore.selectedFile) return
  playerStore.play(playlistsStore.selectedFile.path)
}
</script>

<style lang="scss">
.bb-player {
  padding: $bb-spacing-small;
}
</style>
