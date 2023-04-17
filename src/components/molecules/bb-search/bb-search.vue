

<template>
  <div class="bb-search">
    <BBButton @click="goHome">
      <inline-svg
        :src="IconHome"
        aria-label="Retourner sur la page d'accueil"
      />
    </BBButton>
    <BBInput
      v-model="playlistsStore.filter"
      placeholder="Rechercher"
      @input="goSearch()"
      @focus="goSearch()"
    />
    <BBButton @click="sortPlaylists">
      <inline-svg
        :src="IconSort"
        aria-label="Changer l'order des playlists"
      />
    </BBButton>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import BBInput from '../../atoms/bb-input/bb-input.vue'
import IconHome from '../../../assets/icons/i-home.svg'
import IconSort from '../../../assets/icons/i-sort.svg'
import { useRouter } from 'vue-router'
import { usePlaylistsStore } from '../../../stores/playlists.store'
const playlistsStore = usePlaylistsStore()
const router = useRouter()

const goHome = () => {
  router.push({ name: 'home' })
}

const goSearch = () => {
  if ((playlistsStore.filter?.length || 0) > 1) {
    router.push({ name: 'search' })
  } else if (
    (playlistsStore.filter?.length || 0) === 0
    && router.currentRoute.value.name !== 'tracklist'
  ) {
    router.back()
  }
}

const sortPlaylists = () => {
  const sortOrder = playlistsStore.sortOrder
  if (sortOrder === 'ASC') {
    playlistsStore.sortOrder = 'DESC'
  } else if (sortOrder === 'DESC') {
    playlistsStore.sortOrder = 'ORDER'
  } else if (sortOrder === 'ORDER') {
    playlistsStore.sortOrder = 'ASC'
  }
}
</script>

<style lang="scss">
.bb-search {
  width: 100%;
  padding: $bb-spacing-small;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: $bb-spacing-small;
}
</style>
