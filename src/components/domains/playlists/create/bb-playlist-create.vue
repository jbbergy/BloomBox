<template>
  <div class="bb-playlist-create">
    <BBButton
      class="bb-playlist-create__btn--add"
      @click="displayCreateModal"
    >
      <inline-svg
        :src="IconPlus"
        aria-label="Créer une playlist"
      />
      Créer un playlist
    </BBButton>
  </div>

  <teleport to="body">
    <BBModal
      v-if="isCreateModalOpen"
      @keyup.escape="isCreateModalOpen = false"
    >
      <template #title>
        Nouvelle playlist
      </template>
      <template #default>
        <BBInput
          v-model="playlistName"
          :focus-when-ready="true"
          placeholder="Nom de la playlist"
          @press:enter="createPlaylist"
        />
      </template>
      <template #actions>
        <BBButton
          @click="hideCreateModal"
          variant="secondary"
        >
          Annuler
        </BBButton>
        <BBButton @click="createPlaylist">
          Valider
        </BBButton>
      </template>
    </BBModal>
  </teleport>
</template>

<script lang="ts" setup>
import { iPlaylist } from 'src/services/interfaces/playlist.interface'
import { v4 as uuid } from 'uuid'
import InlineSvg from 'vue-inline-svg'
import { ref } from 'vue'
import { usePlaylistsStore } from 'src/stores/playlists.store'
import BBButton from 'src/components/atoms/bb-button/bb-button.vue'
import BBInput from 'src/components/atoms/bb-input/bb-input.vue'
import BBModal from 'src/components/atoms/bb-modal/bb-modal.vue'
import IconPlus from 'src/assets/icons/i-plus.svg'

const playlistsStore = usePlaylistsStore()
const isCreateModalOpen = ref(false)
const playlistName = ref()


function displayCreateModal() {
  isCreateModalOpen.value = true
  playlistName.value = null
}

function hideCreateModal() {
  isCreateModalOpen.value = false
}

function createPlaylist() {
  if (!playlistName.value) return
  let maxOrder: Partial<iPlaylist> = {
    order: 0
  }
  if (!playlistsStore.playlists) {
    playlistsStore.playlists = []
  } else {
    maxOrder = playlistsStore.playlists.reduce((prev, current) => (prev.order > current.order) ? prev : current)
  }

  const newPlaylist: iPlaylist = {
    label: playlistName.value,
    uuid: uuid(),
    order: (maxOrder.order || -1) + 1
  }

  playlistsStore.create(newPlaylist)
  hideCreateModal()
  setTimeout(() => {
    const playlistElement = document.getElementById(newPlaylist.uuid)
    if (playlistElement) {
      playlistElement.focus()
      playlistElement.click()
      playlistElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, 300)
}
</script>

<style lang="scss">
.bb-playlist-create {
  position: relative;
  padding: 0 $bb-spacing-small;
  font-size: $bb-font-size-large;

  &__btn {
    &--confirm {
      filter: saturate(0.5);

      svg {
        fill: $positive;
      }
    }

    &--abort {
      filter: saturate(0.5);

      svg {
        fill: $negative;
      }
    }
  }
}
</style>
