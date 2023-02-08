<template>
  <div class="bb-player">
    <div class="bb-player__left">
      <div class="bb-player__cover">
        <img
          v-if="fileImage"
          :src="fileImage"
          alt="Cover"
        />
      </div>
      <div class="bb-player__track-infos">
        <template v-if="playQueueStore.playingFile">
          <div class="bb-player__track-title">
            {{ playQueueStore.playingFile.label }}
          </div>
          <div class="bb-player__track-artist">
            {{ playQueueStore.playingFile.artist }}
          </div>
        </template>
      </div>
    </div>
    <div class="bb-player__middle">
      <div class="bb-player__transport">
        <BBTransportButton
          :is-active="isShuffle"
          @click="onShuffle"
          no-bg
        >
          <inline-svg :src="IconShuffle" aria-label="Mode aléatoire" />
        </BBTransportButton>
        <BBTransportButton @click="onPrevFile">
          <inline-svg :src="IconPrev" aria-label="Fichier précédent" />
        </BBTransportButton>
        <BBTransportButton @click="onPlayFile" size="large">
          <inline-svg v-show="isPaused || !isPlaying" :src="IconPlay" aria-label="Bouton de lecture" />
          <inline-svg v-show="!isPaused && isPlaying" :src="IconPause" aria-label="Bouton de lecture" />
        </BBTransportButton>
        <BBTransportButton @click="onNextFile">
          <inline-svg :src="IconNext" aria-label="Fichier suivant" />
        </BBTransportButton>
        <BBTransportButton
          :is-active="isLoop"
          @click="onLoop"
          no-bg
        >
          <inline-svg :src="IconLoop" aria-label="Lecture en boucle" />
        </BBTransportButton>
      </div>
      <div class="bb-player__seek">
        <BBProgress />
      </div>
    </div>
    <div class="bb-player__right">
      <BBVolumeControl />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import InlineSvg from 'vue-inline-svg';
import IconPlay from '../../../assets/icons/i-play.svg';
import IconPause from '../../../assets/icons/i-pause.svg';
import IconPrev from '../../../assets/icons/i-step-backward.svg';
import IconNext from '../../../assets/icons/i-step-forward.svg';
import IconLoop from '../../../assets/icons/i-loop.svg';
import IconShuffle from '../../../assets/icons/i-shuffle.svg';
import ImgCover from '../../../assets/img/cover.jpg';
import BBTransportButton from '../../../components/atoms/bb-transport-button/bb-transport-button.vue'
import BBProgress from '../../molecules/bb-progress/bb-progress.vue'
import BBVolumeControl from '../../../components/molecules/bb-volume-control/bb-volume-control.vue'
import { iFile } from 'src/services/interfaces/file.interface';
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { usePlayerStore } from '../../../stores/player.store'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const isPaused = ref(false)
const isPlaying = ref(false)

const playQueueStore = usePlayQueueStore()
const playerStore = usePlayerStore()
const playlistsStore = usePlaylistsStore()

const onPlayFile = () => {
  if (!playQueueStore.selectedFile) return
  if (!isPlaying.value && !isPaused.value) {
    playQueueStore.playingFile = playQueueStore.selectedFile
    playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files)
  } else if (isPlaying.value) {
    onPauseFile()
  }
  isPaused.value = playerStore.currentInstance.getIsPaused()
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

const onShuffle = () => {
  playQueueStore.shuffle = !playQueueStore.shuffle
}

const onLoop = () => {
  playQueueStore.loop = !playQueueStore.loop
}

const playingFile = computed(() => {
  return playQueueStore.playingFile
})

const isShuffle = computed(() => {
  return playQueueStore.shuffle
})

const isLoop = computed(() => {
  return playQueueStore.loop
})

const fileImage = computed(() => {
  return playQueueStore.currentCover || ImgCover
})

watch(playingFile, async (value: iFile) => {
  if (value) {
    playlistsStore.currentPlaylist = playlistsStore.selectedPlaylist
    playerStore.play(value.path, () => {
      onNextFile()
    })
    isPlaying.value = !!playerStore.currentInstance?.getIsPlaying()
    isPaused.value = !!playerStore.currentInstance?.getIsPaused()
    await playQueueStore.getCurrentCover()
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
  height: 7rem;

  &__right {
    height: 6rem;
    width: 16rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__left {
    height: 6rem;
    width: 16rem;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    column-gap: $bb-spacing-small;
  }

  &__track-title {
    width: 12rem;
    font-weight: bold;
    font-size: $bb-font-size-regular;
    word-wrap: break-word;
    white-space: break-spaces;
  }

  &__track-artist {
    width: 12rem;
    font-size: $bb-font-size-small;
    word-wrap: break-word;
    white-space: break-spaces;
  }

  &__cover {
    height: 6rem;
    min-width: 6rem;

    img {
      height: 100%;
      border-radius: $bb-border-radius-regular;
    }
  }
}
</style>
