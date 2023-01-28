<template>
  <div class="bb-tracklist">
    <template v-if="files && files.length > 0">
      <BBTracklistFile
        v-for="file in files"
        :key="file.uuid"
        :file="file"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import BBTracklistFile from '../bb-tracklist-file/bb-tracklist-file.vue'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const playlistsStore = usePlaylistsStore()

const files = computed(() => {
  if (!playlistsStore.selectedPlaylist) return
  return playlistsStore.selectedPlaylist?.files
})
</script>
