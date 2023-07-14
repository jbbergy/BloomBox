<template>
  <div
    v-if="hasPlaylists"
    class="bb-tree"
    :key="refreshToken"
  >
    <div
      v-for="playlist in sortedPlaylists"
      :key="playlist.uuid"
      :id="playlist.uuid"
      :class="[
        'bb-tree__item',
        currentPlaylistId === playlist.uuid && 'bb-tree__item--selected'
      ]"
      @dragstart="onDragStart(playlist)"
      @dragover.prevent
      @drop="onDrop(playlist)"
      :draggable="true"
      @click="onSelectNode(playlist)"
      @dblclick="onSelectNode(playlist, true)"
      @keypress.space="onSelectNode(playlist)"
      @keypress.enter="onSelectNode(playlist)"
      tabindex="0"
    >
      <div class="bb-tree__img">
        <img
          :src="playlist.img"
          @error="onCoverLoadError($event)"
        />
      </div>
      <div class="bb-tree__label">
        {{ playlist.label }}
      </div>
      <div class="bb-tree__actions">
        <template v-if="selectedNode?.uuid === playlist.uuid && playlist.label !== 'Titres likés'">
          <BBContextMenu :items="menuItems" />
        </template>
      </div>
    </div>
  </div>

  <teleport to="body">
    <BBModal
      v-if="isEditPlaylistModalOpen"
      @keyup.escape="isEditPlaylistModalOpen = false"
    >
      <template #title>
        Modifier la playlist
        <span class="bb-tree__modal-title">{{ playlistsStore.selectedPlaylist?.label }}</span>
      </template>
      <template #default>
        <div>
          <img
            class="bb-tree__modal-preview"
            :src="modalCoverPreview"
            tabindex="0"
            @keyup.enter="editPlaylistcover"
            @click="editPlaylistcover"
          />
        </div>
        <div>
          <BBInput
            v-model="newPlaylistName"
            :focus-when-ready="true"
            placeholder="Nom de la playlist"
            @press:enter="updatePlaylist"
          />
        </div>
      </template>
      <template #actions>
        <BBButton
          @click="isEditPlaylistModalOpen = false"
          variant="secondary"
        >
          Annuler
        </BBButton>
        <BBButton @click="updatePlaylist">
          Valider
        </BBButton>
      </template>
    </BBModal>
  </teleport>
</template>
<script lang="ts" setup>
import { v4 as uuid } from 'uuid'
import { computed, onBeforeMount, onMounted, watch, ref } from 'vue'
import BBContextMenu from 'src/components/atoms/bb-context-menu/bb-context-menu.vue'
import BBInput from 'src/components/atoms/bb-input/bb-input.vue'
import BBButton from 'src/components/atoms/bb-button/bb-button.vue'
import BBModal from 'src/components/atoms/bb-modal/bb-modal.vue'
import ImgCover from 'src/assets/img/cover.jpg'
import { usePlaylistsStore } from 'src/stores/playlists.store'
import { usePlayQueueStore } from 'src/stores/play-queue.store'
import { useRouter } from 'vue-router'
import { iPlaylist } from 'src/services/interfaces/playlist.interface'
import { iFile } from 'src/services/interfaces/file.interface'
import { getRandomValue } from 'src/utils/random'
import { CacheImageService } from 'src/services/cache/images.cache.service'
const selectedNode = ref<iPlaylist>()

const router = useRouter()
const playlistsStore = usePlaylistsStore()
const playQueueStore = usePlayQueueStore()
const cacheImageService = new CacheImageService()

const firstPlaylistsLoad = ref(true)
const draggingElement = ref<iPlaylist>()
const newPlaylistCover = ref()
const isUpdatePlaylistCover = ref(false)
const newPlaylistName = ref<string | undefined>()
const isEditPlaylistModalOpen = ref(false)
const menuItems = ref([
  {
    label: 'Modifier', func: async () => {
      isEditPlaylistModalOpen.value = true
    }
  },
  {
    label: 'Supprimer', func: async (playlistId: string) => {
      await onDeletePlaylist(playlistId)
    }
  }
])

const modalCoverPreview = computed(() => {
  const newCover = newPlaylistCover.value?.path
  return newCover || playlistsStore.selectedPlaylist?.img
})

const refreshToken = computed(() => playlistsStore.refreshPlaylistsToken)

const hasPlaylists = computed(() => {
  if (sortedPlaylists.value) {
    return sortedPlaylists.value?.length > 0
  }
  return null
})

const sortedPlaylists = computed(() => {
  return playlistsStore.sortedPlaylists
})

const currentPlaylistId = computed(() => playlistsStore.currentPlaylist?.uuid)

const onCoverLoadError = (event) => {
  console.error('bb-tree cover error', event)
  if (event.target) {
    const target = event.target as HTMLElement
    target.src = ImgCover
  }
}

const onDragStart = (playlist: iPlaylist) => {
  if (playlist.label === 'Titres likés') return
  draggingElement.value = playlist
}

const onDrop = (playlist: iPlaylist) => {
  if (playlist.label === 'Titres likés') return
  if (!playlist) return
  updatePlaylistOrder(draggingElement.value, playlist)
}

const updatePlaylistOrder = async (movedPlaylist: iPlaylist, replacedPlaylist: iPlaylist) => {
  if (!movedPlaylist || !sortedPlaylists.value) return

  const asc = movedPlaylist?.order < replacedPlaylist?.order
  const newPlaylists: iPlaylist[] = await Promise.all(playlistsStore.playlists.map((playlist: iPlaylist) => {
    const order = playlist.order

    if (playlist.uuid === movedPlaylist.uuid) {
      return { ...movedPlaylist, order: replacedPlaylist?.order }
    } else if (asc && order > movedPlaylist.order && order <= replacedPlaylist.order) {
      return { ...playlist, order: order > 0 ? order - 1 : order }
    } else if (!asc && order < movedPlaylist.order && order >= replacedPlaylist.order) {
      return { ...playlist, order: order > 0 ? order + 1 : order }
    } else {
      return { ...playlist }
    }
  })
  )
  playlistsStore.playlists = newPlaylists
}

const updatePlaylist = async () => {
  let doUpdate = false
  if (!playlistsStore.selectedPlaylist?.uuid) return
  let foundItem: iPlaylist | null = null
  try {
    foundItem = await playlistsStore.findByUUID(playlistsStore.selectedPlaylist.uuid)
  } catch (error) {
    console.error(error)
  }

  if (newPlaylistName.value) {

    if (!foundItem) return

    foundItem.label = newPlaylistName.value
    doUpdate = true
  }

  if (isUpdatePlaylistCover.value && foundItem) {
    const base64 = await playlistsStore.updateCover(newPlaylistCover.value)
    foundItem.img = base64 as string

    const storeItemIdx = playlistsStore.playlists.findIndex((playlist) => playlist.uuid === playlistsStore.selectedPlaylist?.uuid)
    if (storeItemIdx > -1 && foundItem) {
      playlistsStore.playlists[storeItemIdx] = foundItem
    }
  }

  if (doUpdate && foundItem) {
    try {
      await playlistsStore.update(foundItem.key as number, foundItem)
    } catch (error) {
      console.error(error)
    }
  }

  isUpdatePlaylistCover.value = false
  isEditPlaylistModalOpen.value = false
  playlistsStore.refreshPlaylistsToken = uuid()
}

const onSelectNode = (playlist: iPlaylist, play = false) => {
  selectedNode.value = undefined
  selectedNode.value = playlist
  if (play && playlist.files) {
    let idx = 0
    if (playQueueStore.shuffle) idx = getRandomValue(0, playlist.files.length - 1)
    playQueueStore.selectedFile = playlist.files[idx] as iFile
    playQueueStore.playingFile = playQueueStore.selectedFile
    playQueueStore.addToQueue(playlistsStore.selectedPlaylist?.files)
  }
}

const onDeletePlaylist = async (playlistId: string) => {
  if (!playlistId) return
  if (!confirm('Vous allez supprimer la playlist, on y va ?')) return
  let foundItem: iPlaylist | null = null
  try {
    foundItem = await playlistsStore.findByUUID(playlistId)
  } catch (error) {
    console.error(error)
  }

  if (!foundItem) return

  try {
    await playlistsStore.delete(foundItem)
    router.push({ name: 'home' })
  } catch (error) {
    console.error(error)
  }
}

const editPlaylistcover = () => {
  if (playlistsStore.selectedPlaylist) {
    let input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/gif'
    input.multiple = false

    input.onchange = async (e) => {
      if (playlistsStore.selectedPlaylist && e?.target?.files?.length > 0) {
        newPlaylistCover.value = e.target.files[0]
        isUpdatePlaylistCover.value = true
      }
    }

    input.click()
  }
}

watch(selectedNode, (node: iPlaylist) => {
  if (!node || !playlistsStore.playlists) return
  const playlist: iPlaylist | null = playlistsStore.playlists.find((p) => p.uuid === node.uuid) || null
  playlistsStore.selectedPlaylist = playlist
  router.push({ name: 'tracklist' })
}, {
  deep: true
})

watch(sortedPlaylists, (playlists: iPlaylist[]) => {
  if (playlists && !firstPlaylistsLoad.value) {
    playlists.forEach(async (playlist) => {
      try {
        await playlistsStore.update(playlist.key, playlist)
        console.info('playlist updated successfuly', playlist.key, playlist.label)
      } catch (error) {
        console.error('Error updating playlist', playlist.key, playlist.label)
      }
    })
  }
  firstPlaylistsLoad.value = false
}, {
  deep: true
})

watch(
  () => playlistsStore.selectedPlaylist?.label,
  (value) => {
    newPlaylistName.value = value
  },
  {
    immediate: true
  })

onMounted(async () => {
  try {
    await playlistsStore.init()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style lang="scss">
.bb-tree {
  padding-top: $bb-spacing-small;

  &__modal {

    &-title {
      color: $bb-text-color-3;
    }

    &-preview {
      height: 5.282rem;
      border-radius: $bb-border-radius-regular;
    }
  }

  &__item {
    display: grid;
    grid-template-columns: 4rem auto 3rem;
    padding: $bb-spacing-small;
    align-items: center;
    column-gap: $bb-spacing-small;
    cursor: default;
    outline: none;
    user-select: none;

    &:focus,
    &:hover {
      background-color: $bb-bg-color-1;
    }

    &--selected {
      color: $bb-text-color-3;
    }
  }

  &__img {
    height: 3rem;

    img {
      height: 100%;
      border-radius: $bb-border-radius-regular;
    }
  }

  &__actions {

    svg {
      height: 100%;
      color: $bb-text-color-1;
      fill: $bb-text-color-1;
    }
  }
}
</style>
