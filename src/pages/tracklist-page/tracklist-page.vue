<template>
  <div class="tracklist-page">
    Tracklist {{ playlistsStore.selectedPlaylist }}
  </div>
</template>

<script lang="ts" setup>
import { usePlaylistsStore } from '../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()
</script>
