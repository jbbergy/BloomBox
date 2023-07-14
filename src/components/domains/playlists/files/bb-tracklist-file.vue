<template>
  <div
    :class="[
      'bb-tracklist-file',
      isPlaying && 'bb-tracklist-file--is-playing',
      isSelected && 'bb-tracklist-file--is-selected',
    ]"
    :data-uuid="file.uuid"
    @click="onSelect(false)"
    @dblclick="onPlayFile"
    @keydown.enter.prevent="onSelect(true)"
    @keydown.space.prevent="onSelect(false)"
    @keydown.delete.prevent="onDelete"
    tabindex="0"
  >
    <div class="bb-tracklist-file__playing">
      <inline-svg
        :src="IconPlay"
        aria-label="Lire ce titre"
      />
    </div>
    <div class="bb-tracklist-file__cover">
      <img
        v-if="geTrackPicture"
        :src="geTrackPicture"
        alt="Cover"
        @error="onCoverLoadError($event)"
      />
    </div>
    <div class="bb-tracklist-file__title">
      {{ file.label }}
    </div>
    <div class="bb-tracklist-file__album">
      {{ file.album }}
    </div>
    <div class="bb-tracklist-file__artist">
      {{ file.artist }}
    </div>
    <div class="bb-tracklist-file__time">
      {{ trackTime }}
    </div>
    <div class="bb-tracklist-file__actions"></div>
  </div>
</template>

<script lang="ts" setup>
import PicturePlaceholder from 'src/assets/img/cover.jpg'
import { PropType, computed /*, onUnmounted*/, onBeforeMount, onMounted, ref, watch } from 'vue'
import { iFile } from 'src/services/interfaces/file.interface'
import InlineSvg from 'vue-inline-svg'
import IconPlay from 'src/assets/icons/i-play.svg'
import ImgCover from 'src/assets/img/cover.jpg'
import { usePlayQueueStore } from 'src/stores/play-queue.store'
import { usePlaylistsStore } from 'src/stores/playlists.store'
import { useCacheStore } from 'src/stores/cache.store'
import { iCache } from 'src/services/interfaces/cache.interface'

const cacheStore = useCacheStore()
const playQueueStore = usePlayQueueStore()
const playlistsStore = usePlaylistsStore()
const trackPicture = ref<string | null>(PicturePlaceholder)

const emits = defineEmits(['dblclick'])

onBeforeMount(() => {
  trackPicture.value = PicturePlaceholder
})

onMounted(async () => {
  updatePicture()
})

const props = defineProps({
  file: {
    type: Object as PropType<iFile>,
    required: true,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const refreshCovers = computed(() => playlistsStore.refreshCovers)

const geTrackPicture = computed(() => {
  return trackPicture.value
})

watch(refreshCovers, (value) => {
  if (value) {
    updatePicture()
  }
})

const trackTime = computed(() => {
  const time = getFileDuration(props.file.time)
  if (time) {
    return `${time.m}:${time.s}`
  } else {
    return '--:--'
  }
})

const onCoverLoadError = (event) => {
  if (event.target) {
    const target = event.target as HTMLElement
    target.src = ImgCover
  }
}

const updatePicture = async () => {
  if (props?.file?.album) {
    let cacheResponse: iCache | null = await cacheStore.get(props.file.album)
    trackPicture.value = cacheResponse || PicturePlaceholder
  }
}

const getFileDuration = (duration) => {
  const minuts = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return {
    m: minuts,
    s: seconds < 10 ? `0${seconds}` : seconds,
  }
}

const onSelect = (play: boolean) => {
  playQueueStore.selectedFile = props.file
  if (play) {
    onPlayFile()
  }
}

const onDelete = async () => {
  if (!playQueueStore.selectedFile) return
  if (!confirm(`Vous allez supprimer ${props.file.label}, on y va ?`)) return
  await playlistsStore.deleteFile(props.file)
}

const onPlayFile = () => {
  emits('dblclick')
  if (!playQueueStore.selectedFile) return
  playQueueStore.playingFile = playQueueStore.selectedFile
  playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files)
}
</script>

<style lang="scss">
.bb-tracklist-file {
  $self: &;
  padding: $bb-spacing-small;
  display: grid;
  grid-template-columns: 2rem 2rem 2fr 2fr 2fr 1fr 1fr;
  height: 3.5rem;
  align-items: center;
  column-gap: $bb-spacing-regular;
  user-select: none;
  font-size: $bb-font-size-regular;
  outline: none;
  user-select: none;

  &__cover {
    display: flex;
    align-items: center;

    img {
      height: 2rem;
      border-radius: $bb-border-radius-regular;
    }
  }

  &__playing {
    display: flex;
    justify-content: center;

    svg {
      display: none;
      height: 1rem;
      fill: $bb-color-Feijoa;
    }
  }

  &--is-selected,
  &:focus,
  &:hover {
    background-color: $bb-bg-color-1;
  }

  &--is-playing {
    color: $bb-text-color-3;

    #{$self}__playing {
      svg {
        display: block;
      }
    }
  }
}
</style>
