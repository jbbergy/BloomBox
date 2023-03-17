<template>
  <div class="bb-player">
    <div class="bb-player__left">
      <div class="bb-player__vu-meter">
        <div class="bb-player__vu-meter-value" />
      </div>
      <div class="bb-player__cover">
        <BBTransportButton
          v-if="hasFileToPlay"
          @click="toggleFav()"
          no-bg
          class="bb-player__fav-btn"
        >
          <inline-svg
            :src="favIcon"
            aria-label="Ajouter/Supprimer des favoris"
          />
        </BBTransportButton>
        <img
          v-if="fileImage"
          :src="fileImage"
          alt="Cover"
          @error="onCoverError($event)"
        />
      </div>
      <div class="bb-player__track-infos">
        <template v-if="playQueueStore.playingFile">
          <div @click="scrollTotitle" class="bb-player__track-title" tabindex="0">
            {{ playQueueStore.playingFile.label }}
          </div>
          <div @click="scrollTotitle" class="bb-player__track-artist">
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
            aria-label="Bouton de pause"
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
import IconHeart from '../../../assets/icons/heart.svg'
import IconHeartFilled from '../../../assets/icons/heart-filled.svg'
import ImgCover from '../../../assets/img/cover.jpg'
import BBTransportButton from '../../../components/atoms/bb-transport-button/bb-transport-button.vue'
import BBProgress from '../../molecules/bb-progress/bb-progress.vue'
import BBVolumeControl from '../../../components/molecules/bb-volume-control/bb-volume-control.vue'
import { iFile } from 'src/services/interfaces/file.interface'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { usePlayerStore } from '../../../stores/player.store'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { iPlaylist } from 'src/services/interfaces/playlist.interface'

const IS_SHUFFLE = 'is-shuffle'
const IS_LOOP = 'is-loop'

const isCoverOnError = ref(false)
const timeoutId = ref<NodeJS.Timeout>(null)

const playQueueStore = usePlayQueueStore()
const playerStore = usePlayerStore()
const playlistsStore = usePlaylistsStore()

onMounted(() => {
  window.ipcRenderer.on('media-next-track', () => {
    onNextFile()
  })
  window.ipcRenderer.on('media-previous-track', () => {
    onPrevFile()
  })
  window.ipcRenderer.on('media-play-pause-track', () => {
    onPlayFile()
  })

  playQueueStore.shuffle = localStorage.getItem(IS_SHUFFLE) === 'true'
  playQueueStore.loop = localStorage.getItem(IS_LOOP) === 'true'

  window.addEventListener('keydown', (event: Event) => {
    if (timeoutId.value) clearTimeout(timeoutId.value)

    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

    const keyCodeToPrevent = [32]
    if (keyCodeToPrevent.includes(event.keyCode)) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    timeoutId.value = setTimeout(() => {
      if (event.keyCode === 32 || event.keyCode === 179) {
        // space / play/pause
        onPlayFile()
      }
      clearTimeout(timeoutId.value)
    }, 1)
  })
})

const getRMSLevel = computed(() => `${playerStore.currentVolume}%`);
const isPaused = computed(() => playerStore.currentInstance?.getIsPaused());
const isPlaying = computed(() => playerStore.currentInstance?.getIsPlaying());
const favIcon = computed(() => isFav.value ? IconHeartFilled : IconHeart )
const hasFileToPlay = computed(() => playQueueStore.playingFile )
const isFav = computed(() => {
  const playlistFav = playlistsStore.playlists?.find((playlist: iPlaylist) => playlist.label === 'Titres likés')

  if (playlistFav?.files) {
    const fileIndex = playlistFav.files.findIndex((file: iFile) => file.uuid === playQueueStore.playingFile?.uuid)
    return fileIndex > -1
  }
  return false
})
const onCoverError = (event) => {
  console.error('bb-player cover error', event)
  isCoverOnError.value = true
}

const toggleFav = () => {
  if(isFav.value && playQueueStore.playingFile) {
    playlistsStore.removeFilefromFav(playQueueStore.playingFile)
    isFav.value = false
  } else if(!isFav.value && playQueueStore.playingFile) {
    playlistsStore.addFileToFav(playQueueStore.playingFile)
    isFav.value = true
  }
}

const scrollTotitle = () => {
  if (!playQueueStore.playingFile || !playlistsStore.currentPlaylist) return
  const playlist = document.getElementById(playlistsStore.currentPlaylist.uuid)
  if (!playlist) return
  playlist.click()
  playlist.focus()
  setTimeout(() => {
    const element = document.querySelector(
      `[data-uuid="${playQueueStore.playingFile.uuid}"]`
    );
    if (!element) return
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 300)
}

const onPlayFile = () => {
  if (!playQueueStore.selectedFile) return
  if (!isPlaying.value && !isPaused.value) {
    playQueueStore.playingFile = playQueueStore.selectedFile
    playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files)
  } else if (
    (isPlaying.value && !isPaused.value) ||
    (!isPlaying.value && isPaused.value)
  ) {
    onPauseFile()
  }
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
  localStorage.setItem(IS_SHUFFLE, playQueueStore.shuffle)
}

const onLoop = () => {
  playQueueStore.loop = !playQueueStore.loop
  localStorage.setItem(IS_LOOP, playQueueStore.loop)
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
  if (isCoverOnError.value) return ImgCover
  return playQueueStore.currentCover || ImgCover
})

watch(
  playingFile,
  async (value: iFile) => {
    if (value) {
      isCoverOnError.value = false
      playlistsStore.currentPlaylist = playlistsStore.selectedPlaylist;
      playerStore.play(value.path, () => {
        onNextFile();
      });
      playQueueStore.getCurrentCover();
    }
  },
  {
    deep: true,
  }
);
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
    display: grid;
    align-items: flex-start;
    justify-content: flex-start;
    column-gap: $bb-spacing-small;
    grid-template-columns: auto 6rem auto;
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
    position: relative;
    height: 6rem;
    min-width: 6rem;

    img {
      height: 100%;
      border-radius: $bb-border-radius-regular;
    }
  }

  &__fav-btn {
    position: absolute;
    right: -2.75rem;
    bottom: -0.75rem;

    svg {
      width: 1rem;
    }
  }

  &__vu-meter {
    position: relative;
    height: 6rem;
    width: 0.5rem;
    overflow: hidden;
    background-color: $bb-bg-color-3;
    border-radius: $bb-border-radius-regular;

    &-value {
      position: absolute;
      height: v-bind(getRMSLevel);
      bottom: 0;
      left: 0;
      right: 0;
      background-color: $bb-bg-color-4;
    }
  }
}
</style>
