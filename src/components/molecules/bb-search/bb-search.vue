

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
import { watch, computed } from 'vue'
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import BBInput from '../../atoms/bb-input/bb-input.vue'
import IconHome from '../../../assets/icons/i-home.svg'
import IconSort from '../../../assets/icons/i-sort.svg'
import { useRouter } from 'vue-router'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { CacheImageService } from '../../../services/cache/images.cache.service'

const cacheImageService= new CacheImageService()
const playlistsStore = usePlaylistsStore()
const router = useRouter()

const filterValue = computed(() => playlistsStore.filter)

watch(filterValue, (value) => {
  if (value === ':refresh') {
    if (confirm('Rafraichir le cache des images au prochain redémarrage de l\'application ?')) {
      cacheImageService.setForceUpdate()
    }
  }
})

const goHome = () => {
  router.push({ name: 'home' })
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
