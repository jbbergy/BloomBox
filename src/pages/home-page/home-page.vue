<template>
  <q-page class="home-page">
    <h2 class="home-page__section-title">
      Playlists récentes
    </h2>
    <div
      class="home-page__last-playlists"
      v-if="(playlistsStore.lastPlaylists?.length || 0) > 0"
    >
      <BBCard
        v-for="playlist in playlistsStore.lastPlaylists"
        :key="playlist.uuid"
        @click="goToPlaylist(playlist)"
      >
        <div class="home-page__playlist-img">
          <img
            :src="playlistsStore.getPlaylistCover(playlist)"
            @error="onCoverLoadError($event)"
          />
        </div>
        <div class="home-page__playlist-title">
          {{ playlist.label }}
        </div>
      </BBCard>
    </div>
    <div
      v-else
      class="home-page__no-playlists"
    >
      Commencez a écouter de la musique ;)
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ImgCover from '../../assets/img/cover.jpg'
import { usePlaylistsStore } from '../../stores/playlists.store'
import BBCard from '../../components/atoms/bb-card/bb-card.vue'
import { iPlaylist } from '../../services/interfaces/playlist.interface';

const playlistsStore = usePlaylistsStore()

const onCoverLoadError = (event) => {
  if (event.target) {
    const target = event.target as HTMLElement
    target.src = ImgCover
  }
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
.home-page {

  &__no-playlists {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 8rem;
    padding: $bb-spacing-small;
    margin: $bb-spacing-small;
    border-radius: $bb-border-radius-regular;
  }

  &__section {

    &-title {
      padding-left: $bb-spacing-small;
      font-size: $bb-font-size-large;
    }
  }

  &__last-playlists {
    display: flex;
  }

  &__playlist {
    &-img {

      img {
        width: 100%;
        border-radius: $bb-border-radius-regular;
      }
    }
  }
}
</style>
