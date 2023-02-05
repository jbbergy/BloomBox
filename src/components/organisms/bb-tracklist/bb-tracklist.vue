<template>
  <div class="bb-tracklist">
    <div class="bb-tracklist__headers">
      <div></div>
      <div></div>
      <div>Titre</div>
      <div>Album</div>
      <div>Atriste</div>
      <div></div>
      <div></div>
    </div>
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

  &__headers {
    padding: $bb-spacing-small;
    display: grid;
    grid-template-columns: 2rem 2rem 2fr 2fr 2fr 1fr 1fr;
    height: 3rem;
    align-items: center;
    column-gap: $bb-spacing-regular;
    color: $bb-text-color-1;
  }
}
</style>
