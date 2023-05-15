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
            @click="exportLibrary"
          >
            Exporter la bibliothéque
          </BBButton>
          <BBButton
            noBg
            @click="isSettingsModalOpen = false"
          >
            Importer la bibliothéque
          </BBButton>
          <BBButton
            noBg
            @click="isSettingsModalOpen = false"
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
import { ref } from 'vue'
import BBModal from '../../atoms/bb-modal/bb-modal.vue'
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import IconSetting from '../../../assets/icons/i-settings.svg'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { D } from 'app/dist/electron/UnPackaged/assets/index.13a170d4'

const playlistsStore = usePlaylistsStore()

const isSettingsModalOpen = ref<boolean>(false)

async function exportLibrary(): Promise<string> {
  return new Promise((resolve) => {
    const library = JSON.stringify(playlistsStore.playlists)
    const blobLibrary = new Blob([library], { type: 'application/json' })
    const aElement = document.createElement('a')
    aElement.href = URL.createObjectURL(blobLibrary)
    aElement.download = `bloombox_library-${new Date().toISOString()}.json`
    document.body.appendChild(aElement)
    aElement.click()
    document.body.removeChild(aElement)
    resolve(aElement.download)
  })
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
