<template>
  <div
    class="bb-tracklist-header"
    v-if="playlistsStore.selectedPlaylist"
  >
    <img
      :src="playlistCover"
      class="bb-tracklist-header__cover"
    />
    <div class="bb-tracklist-header__text">
      <h1 class="bb-tracklist-header__title">
        {{  playlistsStore.selectedPlaylist.label }}
      </h1>
      <div class="bb-tracklist-header__infos">
        <template v-if="nbFiles > 0">
        {{ nbFiles }}&nbsp;{{ nbFiles > 1 ? 'Titres' : 'Titre' }}
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import ImgCover from '../../../assets/img/cover.jpg'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()

const nbFiles = computed(() => {
  return playlistsStore.selectedPlaylist?.files?.length || 0
})

const playlistCover = computed(() => {
  return playlistsStore.selectedPlaylist?.img || ImgCover
})

</script>

<style lang="scss">
.bb-tracklist-header {
  padding: $bb-spacing-small;
  display: flex;
  align-items: flex-start;
  column-gap: $bb-spacing-small;

&__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: $bb-spacing-small;
}

&__title {
  font-size: $bb-font-size-xlarge;
  line-height: $bb-font-size-xlarge;
  text-transform: capitalize;
  margin: 0;
  font-weight: $bb-font-weight-regular;
}

&__infos {
  font-size: $bb-font-size-small;
  line-height: $bb-font-size-small;
  font-weight: $bb-font-weight-regular;
  padding-left: $bb-spacing-xsmall;
}

  &__cover {
    height: 5.282rem;
    border-radius: $bb-border-radius-regular;
  }
}
</style>
