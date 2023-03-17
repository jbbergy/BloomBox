<template>
  <div
      v-if="hasPlayists"
      class="bb-tree"
  >
    <div
      v-for="(playlist, idx) in filteredPlaylists"
      :key="playlist.uuid"
      :id="playlist.uuid"
      :class="[
        'bb-tree__item',
        currentPlaylistId === playlist.uuid && 'bb-tree__item--selected'
      ]"
      @dragstart="onDragStart(playlist)"
      @dragover.prevent @drop="onDrop(playlist, idx)"
      :draggable="true"
      @click="onSelectNode(playlist)"
      @dblclick="onSelectNode(playlist, true)"
      @keypress.space="onSelectNode(playlist)"
      @keypress.enter="onSelectNode(playlist)"
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
import { computed, onBeforeMount,onMounted, watch, ref } from 'vue'
import BBContextMenu from '../../atoms/bb-context-menu/bb-context-menu.vue'
import BBInput from '../../atoms/bb-input/bb-input.vue'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import BBModal from '../../atoms/bb-modal/bb-modal.vue'
import ImgCover from '../../../assets/img/cover.jpg'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { PlaylistsService } from '../../../services/playlists/playlists.service'
import { useRouter } from 'vue-router'
import { iPlaylist } from '../../../services/interfaces/playlist.interface'
import { iFile } from '../../../services/interfaces/file.interface'
import { getRandomValue } from '../../../utils/random'
const selectedNode = ref<iPlaylist>()

const router = useRouter()
const playlistsStore = usePlaylistsStore()
const playQueueStore = usePlayQueueStore()
const playlistsService = new PlaylistsService()

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
  const oldCover = playlistsStore.getPlaylistCover(playlistsStore.selectedPlaylist as iPlaylist)
  return newCover || oldCover
})

const hasPlayists = computed(() => {
  if (filteredPlaylists.value) {
    return filteredPlaylists.value?.length > 0
  }
  return null
})

const filteredPlaylists = computed(() => {
  return playlistsStore.filteredPlaylists
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

const onDrop = (playlist: iPlaylist, index: number) => {
  if (playlist.label === 'Titres likés') return
  if (!playlist) return
  updatePlaylistOrder(draggingElement.value, index)
}

const updatePlaylistOrder = async (movedPlaylist: iPlaylist, newIndex: number) => {
  if (!movedPlaylist || !filteredPlaylists.value) return

  const replacedPlaylist = filteredPlaylists.value.find((playlist: iPlaylist) => playlist.order === newIndex)
  const asc = movedPlaylist?.order < replacedPlaylist?.order
  const newPlaylists: iPlaylist[] = playlistsStore.playlists.map((playlist:iPlaylist, index: number) => {
    const order = playlist.order || index

    if (playlist.uuid === movedPlaylist.uuid) {
      return {...movedPlaylist, order: replacedPlaylist?.order }
    } else if (asc && order >= movedPlaylist.order && order < replacedPlaylist.order) {
      return {...playlist, order: order > 0 ? order - 1 : order }
    } else if (!asc && order <= movedPlaylist.order && order > replacedPlaylist.order) {
      return {...playlist, order: order > 0 ? order + 1 : order }
    } else {
      return {...playlist}
    }
  })

  playlistsStore.playlists = newPlaylists
}

const updatePlaylist = async () => { 
  if (!playlistsStore.selectedPlaylist?.uuid) return
  if (newPlaylistName.value) {
    let foundItem: iPlaylist | null = null
    try {
      foundItem = await playlistsService.findByUUID(playlistsStore.selectedPlaylist.uuid)
    } catch (error) {
      console.error(error)
    }

    if (!foundItem) return

    foundItem.label = newPlaylistName.value

    try {
      await playlistsService.update(foundItem.key, foundItem)
      await playlistsStore.init()
    } catch (error) {
      console.error(error)
    }
  }

  if (isUpdatePlaylistCover.value) {
    await playlistsStore.updateCover(newPlaylistCover.value)
  }
  isUpdatePlaylistCover.value = false
  isEditPlaylistModalOpen.value = false
}

const onSelectNode = (playlist: iPlaylist, play = false) => {
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
  let foundItem: unknown = null
  try {
    foundItem = await playlistsService.findByUUID(playlistId)
  } catch (error) {
    console.error(error)
  }

  if (!foundItem) return

  try {
    await playlistsService.delete(foundItem.key)
    await playlistsStore.init()
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
})

watch(filteredPlaylists, (playlists: iPlaylist[]) => {
  if (playlists && !firstPlaylistsLoad.value) {
    playlists.forEach(async (playlist) => {
      try {
        await playlistsService.update(playlist.key, playlist)
        console.info('playlist updated successfuly', playlist.key, playlist.label)
        } catch(error) {
        console.error('Error updating playlist', playlist.key, playlist.label)
      }
    })
  }
  firstPlaylistsLoad.value = false
}, {
  deep: true
})

onBeforeMount(async () => {
  try {
    await playlistsService.init()
  } catch (error) {
    console.error(error)
  }
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

  &__modal{
    
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
