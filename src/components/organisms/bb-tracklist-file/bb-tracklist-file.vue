<template>
  <div
    class="bb-tracklist-file"
    @click="onSelect"
  >
    <div class="bb-tracklist-file__playing">
      <inline-svg
          :src="IconPlay"
          aria-label="Lire ce titre"
        />
    </div>
    <div class="bb-tracklist-file__cover">
      <img src="../../../assets/img/cover.jpg"/>
    </div>
    <div class="bb-tracklist-file__title">
      {{ file.label }}
    </div>
    <div class="bb-tracklist-file__time">
      4:32
    </div>
    <div class="bb-tracklist-file__actions">
      actions
    </div>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import IconPlay from '../../../assets/icons/i-play.svg'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()

const props = defineProps({
  file: {
    type: Object,
    required: true
  }
})

const onSelect = () => {
  playlistsStore.selectedFile = props.file
}
</script>

<style lang="scss">
.bb-tracklist-file {
  $self:&;
  padding: $bb-spacing-small;
  display: grid;
  grid-template-columns: 2rem 2rem auto 4rem 4rem;
  height: 3rem;
  align-items: center;
  column-gap: $bb-spacing-regular;

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

  &:hover {
    background-color: $bb-bg-color-1;

    #{$self}__playing {

      svg {
        display: block;
      }
    }
  }
}
</style>
