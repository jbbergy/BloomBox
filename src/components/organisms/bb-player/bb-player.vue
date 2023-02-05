<template>
  <div class="bb-player">
    <div class="bb-player__left">
    </div>
    <div class="bb-player__middle">
      <div class="bb-player__transport">
        <BBTransportButton @click="onPrevFile">
          <inline-svg :src="IconPrev" aria-label="Fichier précédent" />
        </BBTransportButton>
        <BBTransportButton @click="onPlayFile" size="large">
          <inline-svg :src="IconPlay" aria-label="Bouton de lecture" />
        </BBTransportButton>
        <BBTransportButton @click="onPauseFile" size="large">
          <inline-svg :src="IconPause" aria-label="Bouton de lecture" />
       </BBTransportButton>
        <BBTransportButton @click="onNextFile">
          <inline-svg :src="IconNext" aria-label="Fichier suivant" />
        </BBTransportButton>
      </div>
      <div class="bb-player__seek"></div>
    </div>
    <div class="bb-player__right"></div>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg';
import IconPlay from '../../../assets/icons/i-play.svg';
import IconPause from '../../../assets/icons/i-pause.svg';
import IconPrev from '../../../assets/icons/i-step-backward.svg';
import IconNext from '../../../assets/icons/i-step-forward.svg';
import BBTransportButton from '../../../components/atoms/bb-transport-button/bb-transport-button.vue'
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
    playerStore.play(value.path, () => {
      onNextFile()
    })
  }
}, {
  deep: true
})

</script>

<style lang="scss">
.bb-player {
  padding: $bb-spacing-small;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
