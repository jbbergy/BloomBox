<template>
  <div
    :class="[
      'bb-tracklist-file',
      isPlaying && 'bb-tracklist-file--is-playing',
      isSelected && 'bb-tracklist-file--is-selected'
    ]"
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
      {{ file.artist ? file.artist + ' - ' : '' }}
      {{ file.album ? file.album + ' - ' : '' }}
      {{ file.label }}
    </div>
    <div class="bb-tracklist-file__time">4:32</div>
    <div class="bb-tracklist-file__actions">actions</div>
  </div>
</template>

<script lang="ts" setup>
import { Buffer } from 'buffer'
import PicturePlaceholder from '../../../assets/img/cover.jpg'
import { PropType, computed } from 'vue';
import { iFile } from 'src/services/interfaces/file.interface';
import InlineSvg from 'vue-inline-svg';
import IconPlay from '../../../assets/icons/i-play.svg';
import { usePlayQueueStore } from '../../../stores/play-queue.store';
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playQueueStore = usePlayQueueStore();
const playlistsStore = usePlaylistsStore()

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


const trackPicture = computed(() => {
  if (props.file?.picture?.data) {
    let image = Buffer.from(props.file?.picture?.data).toString('base64')
    return `data:${props.file?.picture?.format};base64,${image}`
  } else {
    return PicturePlaceholder
  }

})

const onSelect = () => {
  playQueueStore.selectedFile = props.file;
};

const onPlayFile = () => {
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
  grid-template-columns: 2rem 2rem auto 4rem 4rem;
  height: 3rem;
  align-items: center;
  column-gap: $bb-spacing-regular;
  user-select: none;
  transition: all .25s ease;

  &__cover {
    display: flex;
    align-items: center;

    img {
      height: 2rem;
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
    color: $bb-color-Feijoa;

    #{$self}__playing {
      svg {
        display: block;
      }
    }
  }
}
</style>
