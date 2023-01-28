<template>
  <div
    class="bb-tracklist-header"
    v-if="playlistsStore.selectedPlaylist"
  >
    <img
      src="../../../assets/img/cover.jpg"
      class="bb-tracklist-header__cover"
    />
    <h1 class="bb-tracklist-header__title">
      {{  playlistsStore.selectedPlaylist.label }}
    </h1>
  </div>
</template>

<script lang="ts" setup>
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()
</script>

<style lang="scss">
.bb-tracklist-header {
  padding: $bb-spacing-small;
  display: flex;
  align-items: center;
  column-gap: $bb-spacing-small;

  &__title {
    font-size: $bb-font-size-xlarge;
    line-height: $bb-font-size-xlarge;
    text-transform: capitalize;
    margin: 0;
    font-weight: $bb-font-weight-regular;
  }

  &__cover {
    height: 5.282rem;
    border-radius: $bb-border-radius-regular;
  }
}
</style>
