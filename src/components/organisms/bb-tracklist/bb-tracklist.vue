<template>
  <div class="bb-tracklist">
    <template v-if="files && files.length > 0">
      <BBTracklistFile
        v-for="file in files"
        :key="file.uuid"
        :file="file"
        :is-playing="isPlaying(file)"
        :is-selected="isSelected(file)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import BBTracklistFile from '../bb-tracklist-file/bb-tracklist-file.vue'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { iFile } from 'src/services/interfaces/file.interface';

const playQueueStore = usePlayQueueStore()
const playlistsStore = usePlaylistsStore()

const files = computed(() => {
  if (!playlistsStore.selectedPlaylist) return
  if (playlistsStore.selectedPlaylist?.files?.length > 0) {
    return playlistsStore.selectedPlaylist?.files
  }
  return null
})

const isPlaying = (file: iFile) => {
return file.uuid === playQueueStore.playingFile?.uuid
}

const isSelected = (file: iFile) => {
return file.uuid === playQueueStore.selectedFile?.uuid
}
</script>

<style lang="scss">
.bb-tracklist {
  padding-bottom: $bb-spacing-large;
}
</style>
