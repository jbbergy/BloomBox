<template>
  <div class="bb-tracklist-actions">
    <BBButton @click="addTracks">
      Ajouter des titres
    </BBButton>
  </div>
</template>

<script lang="ts" setup>
import BBButton from '../../atoms/bb-button/bb-button.vue'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()
const addTracks = () => {
  let input = document.createElement('input');
  input.type = 'file';
  input.multiple = true

  input.onchange = e => {
    if (playlistsStore.selectedPlaylist && e?.target?.files) {
      playlistsStore.addFileToPlaylist(e.target.files, playlistsStore.selectedPlaylist)
    }
  }

  input.click();
}
</script>

<style lang="scss">
.bb-tracklist-actions {
  padding: $bb-spacing-small;
  display: flex;
  align-items: center;
  column-gap: $bb-spacing-small;
  margin-bottom: $bb-spacing-large;
}
</style>
