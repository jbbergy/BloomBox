<template>
  <div class="bb-header">
    <BBButton
      noBg
      @click="isSettingsModalOpen = true"
    >
      <inline-svg
        :src="IconSetting"
        aria-label="Ouvrir les paramétres de l'application"
      />
    </BBButton>
  </div>

  <teleport to="body">
    <BBModal
      v-if="isSettingsModalOpen"
      @keyup.escape="isSettingsModalOpen = false"
    >
      <template #title>
        Paramétres
      </template>
      <template #default>
        <div class="bb-header__settings">
          <BBButton
            noBg
            :disabled="globalStore.isLoading"
            :isLoading="globalStore.loadingTarget === 'export'"
            @click="exportLibrary"
          >
            Exporter la bibliothéque
          </BBButton>
          <BBButton
            noBg
            :disabled="globalStore.isLoading"
            :isLoading="globalStore.loadingTarget === 'import'"
            @click="importLibrary"
          >
            Importer la bibliothéque
          </BBButton>
          <BBButton
            noBg
            :disabled="globalStore.isLoading"
            :isLoading="globalStore.loadingTarget === 'delete'"
            @click="deleteLibrary"
          >
            Effacer la bibliothéque
          </BBButton>
        </div>
      </template>
      <template #actions>
        <BBButton @click="isSettingsModalOpen = false">
          Fermer
        </BBButton>
      </template>
    </BBModal>
  </teleport>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import BBModal from 'src/components/atoms/bb-modal/bb-modal.vue'
import InlineSvg from 'vue-inline-svg'
import BBButton from 'src/components/atoms/bb-button/bb-button.vue'
import IconSetting from 'src/assets/icons/i-settings.svg'
import { usePlaylistsStore } from 'src/stores/playlists.store'
import { useGlobalStore } from 'src/stores/global.store'
import { useCacheStore } from 'src/stores/cache.store'
import { useRouter } from 'vue-router'

const router = useRouter()
const playlistsStore = usePlaylistsStore()
const globalStore = useGlobalStore()
const cacheStore = useCacheStore()

const isSettingsModalOpen = ref<boolean>(false)

async function exportLibrary(): Promise<string> {
  return new Promise((resolve) => {
    globalStore.isLoading = true
    globalStore.loadingTarget = 'export'
    const library = JSON.stringify(playlistsStore.playlists)
    const blobLibrary = new Blob([library], { type: 'application/json' })
    const aElement = document.createElement('a')
    aElement.href = URL.createObjectURL(blobLibrary)
    aElement.download = `bloombox_library-${new Date().toISOString()}.json`
    document.body.appendChild(aElement)
    aElement.click()
    document.body.removeChild(aElement)
    globalStore.isLoading = false
    globalStore.loadingTarget = null
    resolve(aElement.download)
  })
}

async function importLibrary() {
  isSettingsModalOpen.value = false
  globalStore.isLoading = true
  globalStore.loadingTarget = 'import'
  try {
    await playlistsStore.importLibrary()
  } catch (error) {
    console.error('importLibrary error', error)
  } finally {
    globalStore.isLoading = false
    globalStore.loadingTarget = null
    await playlistsStore.loadPlaylistsImg()
    await playlistsStore.refreshCache()
    nextTick(() => {
      globalStore.setRefreshSidebar()
    })
    router.push({ name: 'home' })
  }
}

async function deleteLibrary() {
  globalStore.isLoading = true
  globalStore.loadingTarget = 'delete'
  try {
    await playlistsStore.deleteAllPlaylists()
  } catch (error) {
    console.error('deleteLibrary error', error)
  } finally {
    globalStore.isLoading = false
    globalStore.loadingTarget = null
  }
}
</script>

<style lang="scss">
.bb-header {
  padding: $bb-spacing-small;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row-reverse;

  &__settings {
    display: flex;
    row-gap: $bb-spacing-small;
    flex-direction: column;
  }
}
</style>
