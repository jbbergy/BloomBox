<template>
  <div class="bb-tracklist-actions">
    <BBButton
      v-if="playlistsStore.selectedPlaylist?.label !== 'Titres likés'"
      @click="addTracks"
    >
      <inline-svg
        :src="IconPlus"
        aria-label="Créer une playlist"
      />
      Ajouter des titres
    </BBButton>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import IconPlus from '../../../assets/icons/i-plus.svg'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()
const addTracks = () => {
  let input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/mpeg,audio/x-wav,audio/ogg,audio/x-m4a,audio/aac,audio/flac'
  input.multiple = true

  input.onchange = e => {
    if (playlistsStore.selectedPlaylist && e?.target?.files) {
      playlistsStore.addFilesToPlaylist(e.target.files)
    }
  }

  input.click()
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
