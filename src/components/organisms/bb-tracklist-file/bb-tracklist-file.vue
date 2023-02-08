<template>
  <div
    :class="[
      'bb-tracklist-file',
      isPlaying && 'bb-tracklist-file--is-playing',
      isSelected && 'bb-tracklist-file--is-selected',
    ]"
    :data-uuid="file.uuid"
    @click="onSelect"
    @dblclick="onPlayFile"
  >
    <div class="bb-tracklist-file__playing">
      <inline-svg :src="IconPlay" aria-label="Lire ce titre" />
    </div>
    <div class="bb-tracklist-file__cover">
      <img :src="trackPicture" alt="Cover" />
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
    <div class="bb-tracklist-file__actions">actions</div>
  </div>
</template>

<script lang="ts" setup>
import { Buffer } from 'buffer';
import PicturePlaceholder from '../../../assets/img/cover.jpg';
import { PropType, computed /*, onUnmounted*/, onMounted, ref } from 'vue';
import { iFile } from 'src/services/interfaces/file.interface';
import { readMetadata } from '../../../services/metadata/metadata.service';
import InlineSvg from 'vue-inline-svg';
import IconPlay from '../../../assets/icons/i-play.svg';
import { usePlayQueueStore } from '../../../stores/play-queue.store';
import { usePlaylistsStore } from '../../../stores/playlists.store';

const playQueueStore = usePlayQueueStore();
const playlistsStore = usePlaylistsStore();
const pictureData = ref(null);
const trackPicture = ref(null)

onMounted(async () => {
  let metadata = null;
  let result = playlistsStore.impageCache[props.file.album]
  trackPicture.value = result || PicturePlaceholder
  if(!result) {
    try {
      metadata = await readMetadata(props.file.path);
    } catch (error) {
      console.error(error);
    }
    if (metadata) {
      pictureData.value = metadata.tags?.picture;
    }

    if (pictureData?.value?.data) {
      let image = Buffer.from(pictureData.value.data).toString('base64')
      result = `data:${pictureData.value.format};base64,${image}`
      playlistsStore.impageCache[props.file.album] = result
      trackPicture.value = result
    }
  }
});

// onUnmounted(() => {
//   playlistsStore.impageCache = {}
// })

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
});

const trackTime = computed(() => {
  const time = getFileDuration(props.file.time)
  if (time) {
    return `${time.m}:${time.s}`
  } else {
    return '--:--'
  }
})

const getFileDuration = (duration) => {
  const minuts = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return {
    m: minuts,
    s: seconds < 10 ? `0${seconds}` : seconds,
  }
}

const onSelect = () => {
  playQueueStore.selectedFile = props.file;
};

const onPlayFile = () => {
  if (!playQueueStore.selectedFile) return;
  playQueueStore.playingFile = playQueueStore.selectedFile;
  playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files);
};
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
