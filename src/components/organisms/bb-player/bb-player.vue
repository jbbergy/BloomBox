<template>
  <div class="bb-player">
    <div class="bb-player__left">
      <div class="bb-player__cover">
        <img v-if="fileImage" :src="fileImage" alt="Cover" />
      </div>
      <div class="bb-player__track-infos">
        <template v-if="playQueueStore.playingFile">
          <div
            @click="scrollTotitle"
            class="bb-player__track-title"
            tabindex="0"
          >
            {{ playQueueStore.playingFile.label }}
          </div>
          <div
            @click="scrollTotitle"
            class="bb-player__track-artist"
          >
            {{ playQueueStore.playingFile.artist }}
          </div>
        </template>
      </div>
    </div>
    <div class="bb-player__middle">
      <div class="bb-player__transport">
        <BBTransportButton :is-active="isShuffle" @click="onShuffle" no-bg>
          <inline-svg :src="IconShuffle" aria-label="Mode aléatoire" />
        </BBTransportButton>
        <BBTransportButton @click="onPrevFile">
          <inline-svg :src="IconPrev" aria-label="Fichier précédent" />
        </BBTransportButton>
        <BBTransportButton @click="onPlayFile" size="large">
          <inline-svg
            v-show="isPaused || !isPlaying"
            :src="IconPlay"
            aria-label="Bouton de lecture"
          />
          <inline-svg
            v-show="!isPaused && isPlaying"
            :src="IconPause"
            aria-label="Bouton de lecture"
          />
        </BBTransportButton>
        <BBTransportButton @click="onNextFile">
          <inline-svg :src="IconNext" aria-label="Fichier suivant" />
        </BBTransportButton>
        <BBTransportButton :is-active="isLoop" @click="onLoop" no-bg>
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
import { watch, computed, ref, onMounted } from 'vue'
import InlineSvg from 'vue-inline-svg'
import IconPlay from '../../../assets/icons/i-play.svg'
import IconPause from '../../../assets/icons/i-pause.svg'
import IconPrev from '../../../assets/icons/i-step-backward.svg'
import IconNext from '../../../assets/icons/i-step-forward.svg'
import IconLoop from '../../../assets/icons/i-loop.svg'
import IconShuffle from '../../../assets/icons/i-shuffle.svg'
import ImgCover from '../../../assets/img/cover.jpg'
import BBTransportButton from '../../../components/atoms/bb-transport-button/bb-transport-button.vue'
import BBProgress from '../../molecules/bb-progress/bb-progress.vue'
import BBVolumeControl from '../../../components/molecules/bb-volume-control/bb-volume-control.vue'
import { iFile } from 'src/services/interfaces/file.interface'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { usePlayerStore } from '../../../stores/player.store'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const isPaused = ref(false)
const isPlaying = ref(false)
const timeoutId = ref<NodeJS.Timeout>(null)
const playTimeoutId = ref<NodeJS.Timeout>(null)
const volumeBackup = ref(0)
const isMute = ref(false)

const playQueueStore = usePlayQueueStore()
const playerStore = usePlayerStore()
const playlistsStore = usePlaylistsStore()

onMounted(() => {
  window.addEventListener('keydown', (event: Event) => {
    if (timeoutId.value) clearTimeout(timeoutId.value)

    const keyCodeToPrevent = [32, 179, 176, 177, 178]
    if (keyCodeToPrevent.includes(event.keyCode)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
    }

    timeoutId.value = setTimeout(() => {
      if (event.keyCode === 32 || event.keyCode === 179) {
        // space / play/pause
        onPlayFile()
      } else if (event.keyCode === 176) {
        // next
        onNextFile()
      } else if (event.keyCode === 177) {
        // prev
        onPrevFile()
      } else if (event.keyCode === 178) {
        // mute
        if (!isMute.value) {
          volumeBackup.value = playerStore?.defaultVolume
          playerStore.defaultVolume = 0
          playerStore.currentInstance?.setVolume(playerStore.defaultVolume)
          isMute.value = true
        } else {
          playerStore.defaultVolume = volumeBackup.value || 0
          playerStore.currentInstance?.setVolume(playerStore.defaultVolume)
          isMute.value = false
        }
      }
      clearTimeout(timeoutId.value)
    }, 1)
  })
})

const scrollTotitle = () => {
  if (!playQueueStore.playingFile || !playlistsStore.currentPlaylist) return
  const playlist = document.getElementById(playlistsStore.currentPlaylist.uuid)
  if (!playlist) return
  playlist.click()
  playlist.focus()
  setTimeout(() => {
    const element = document.querySelector(`[data-uuid="${playQueueStore.playingFile.uuid}"]`)
    if (!element) return
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 300);
}

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

watch(
  playingFile,
  async (value: iFile) => {
    if (value) {
      playlistsStore.currentPlaylist = playlistsStore.selectedPlaylist
      if (playTimeoutId.value) clearTimeout(playTimeoutId.value)
      playTimeoutId.value = setTimeout(() => {
        playerStore.play(value.path, () => {
          onNextFile()
        })
        isPlaying.value = !!playerStore.currentInstance?.getIsPlaying()
        isPaused.value = !!playerStore.currentInstance?.getIsPaused()
      }, 10)
      playQueueStore.getCurrentCover()
    }
  },
  {
    deep: true,
  }
)
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
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__track-artist {
    width: 12rem;
    font-size: $bb-font-size-small;
    word-wrap: break-word;
    white-space: break-spaces;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
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
