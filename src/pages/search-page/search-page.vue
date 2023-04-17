<template>
  <div class="search-page">
    <BBTracklistHeader
      v-if="playlistsStore.filter"
      is-search-header
      :title="playlistsStore.filter"
    />
    <template v-if="playlistsStore.searchFilesInPlaylist">
      <h2 class="search-page__sub-title">Playlists</h2>
      <div
        v-if="(playlistsStore.searchFilesInPlaylist?.playlists?.length || 0) > 0"
        class="search-page__playlists"
      >
        <div
          v-for="playlist in (playlistsStore.searchFilesInPlaylist?.playlists || [])"
          :key="playlist.uuid"
          :id="playlist.uuid"
          class="search-page__playlist-item"
          @dblclick="goToPlaylist(playlist)"
          @keypress.space="goToPlaylist(playlist)"
          @keypress.enter="goToPlaylist(playlist)"
          tabindex="0"
        >
          <div class="bb-tree__img">
            <img
              :src="playlistsStore.getPlaylistCover(playlist)"
              @error="onCoverLoadError($event)"
            />
          </div>
          <div class="bb-tree__label">
            {{ playlist.label }}
          </div>
        </div>
      </div>

      <h2 class="search-page__sub-title">Titres</h2>
      <div
        v-if="(playlistsStore.searchFilesInPlaylist?.files?.length || 0) > 0"
        class="search-page__files"
      >
        <BBTracklistFile
          v-for="file in (playlistsStore.searchFilesInPlaylist?.files || [])"
          :key="file.uuid"
          :file="file"
          @dblclick="goToTitle(file)"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import BBTracklistFile from '../../components/organisms/bb-tracklist-file/bb-tracklist-file.vue'
import { usePlaylistsStore } from '../../stores/playlists.store'
import { usePlayQueueStore } from '../../stores/play-queue.store'
import BBTracklistHeader from '../../components/organisms/bb-tracklist-header/bb-tracklist-header.vue'
import { iFile } from '../../services/interfaces/file.interface';
import { iPlaylist } from '../../services/interfaces/playlist.interface';
import ImgCover from '../../assets/img/cover.jpg'

const playlistsStore = usePlaylistsStore()
const playQueueStore = usePlayQueueStore()


const onCoverLoadError = (event) => {
  if (event.target) {
    const target = event.target as HTMLElement
    target.src = ImgCover
  }
}

const goToTitle = (fileToGo: iFile) => {
  if (!fileToGo && fileToGo.playlistId) return
  const playlist = document.getElementById(fileToGo.playlistId)
  if (!playlist) return
  playlist.click()
  playlist.focus()
  setTimeout(() => {
    const element = document.querySelector(
      `[data-uuid="${fileToGo.uuid}"]`
    );
    if (!element) return
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
    playQueueStore.playingFile = fileToGo
  }, 300)
}

const goToPlaylist = (playlistToGo: iPlaylist) => {

  if (!playlistToGo) return
  const playlist = document.getElementById(playlistToGo.uuid)
  if (!playlist) return
  playlist.click()
  playlist.focus()
}
</script>

<style lang="scss">
.search-page {

  &__sub-title {
    padding-left: $bb-spacing-small;
    font-size: $bb-font-size-large;
  }

  &__playlists {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    column-gap: $bb-spacing-regular;
    padding: $bb-spacing-small;
    margin-bottom: $bb-spacing-large;
  }

  &__playlist-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    column-gap: $bb-spacing-small;
    cursor: default;
    outline: none;
    user-select: none;
    padding: $bb-spacing-small;
    width: 100%;

    &:focus,
    &:hover {
      background-color: $bb-bg-color-1;
    }
  }
}
</style>
