<template>
  <div class="bb-player">
    <div class="bb-player__left">
      {{ playQueueStore.selectedFile }}
    </div>
    <div class="bb-player__middle">
      <div class="bb-player__transport">
        <button @click="onPlayFile">Play</button>
        <button @click="onPauseFile">Pause</button>
        <button @click="onPrevFile">Prev</button>
        <button @click="onNextFile">Next</button>
      </div>
      <div class="bb-player__seek"></div>
    </div>
    <div class="bb-player__right"></div>
  </div>
</template>

<script lang="ts" setup>
import { iFile } from 'src/services/interfaces/file.interface';
import { watch, computed } from 'vue'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { usePlayerStore } from '../../../stores/player.store'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playQueueStore = usePlayQueueStore()
const playerStore = usePlayerStore()
const playlistsStore = usePlaylistsStore()

const onPlayFile = () => {
  if (!playQueueStore.selectedFile) return
  playQueueStore.playingFile = playQueueStore.selectedFile
  playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files)
}

const onPauseFile = () => {
  if (!playQueueStore.playingFile) return
  playerStore.pause()
}

const onPrevFile = () => {
  if (!playQueueStore.playingFile) return
  playQueueStore.prevFile()
}

const onNextFile = () => {
  if (!playQueueStore.playingFile) return
  playQueueStore.nextFile()
}

const playingFile = computed(() => {
  return playQueueStore.playingFile
})

watch(playingFile, (value: iFile) => {
  if (value) {
    playerStore.play(value.path)
  }
}, {
  deep: true
})

</script>

<style lang="scss">
.bb-player {
  padding: $bb-spacing-small;
}
</style>
