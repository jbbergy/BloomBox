<template>
  <div
    class="bb-tree"
    @click="onClickItem($event)"
  >
    <q-tree
      v-if="hasPlaylists"
      :nodes="playlistsStore.getPlaylists"
      node-key="uuid"
      no-connectors
      v-model:selected="selectedNode"
    />
    <div
      v-if="showOverlay"
      class="bb-tree__overlay"
    >
      <BBButton @click="onDeletePlaylist">
        <inline-svg
          :src="IconTrash"
          aria-label="My image"
        />
      </BBButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import { ref, onMounted, computed, watch } from 'vue';
import BBButton from '../../atoms/bb-button/bb-button.vue'
import IconTrash from '../../../assets/icons/i-trash.svg'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { usePlaylistsService } from '../../../services/playlists/playlists.service'
import { useRouter } from 'vue-router'

const router = useRouter()
const playlistsStore = usePlaylistsStore()
const playlistsService = new usePlaylistsService()
const selectedNode = ref(null)

const overlayY = ref('0px')
const showOverlay = ref(false)

watch(selectedNode, (node) => {
  if (!node) return
  const playlist = playlistsStore.playlists.find(p => p.uuid === node)
  playlistsStore.selectedPlaylist = playlist
  router.push({ name: 'tracklist'})
})

const onClickItem = (event) => {
  if (
    event.target.classList.value.includes('bb-tree')
    || event.target.classList.value.includes('q-tree ')
  ) return
  overlayY.value = `${event.pageY - event.offsetY - 48}px`
  showOverlay.value = true
}

const onDeletePlaylist = async () => {
  if(!confirm('Vous allez supprimer la playlist, on y va ?')) return
  let foundItem: unknown = null
  try {
    foundItem = await playlistsService.findByUUID(selectedNode.value)
  } catch (error) {
    console.error(error)
  }

  if (!foundItem) return

  try {
    await playlistsService.delete(foundItem.key)
    showOverlay.value = false
    await playlistsStore.init()
    router.push({ name: 'home'})
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  try {
    await playlistsStore.init()
  } catch (error) {
    console.error(error)
  }
})

const hasPlaylists = computed(() => {
  return playlistsStore.getPlaylists?.length > 0
})
</script>

<style lang="scss">
.bb-tree {
  padding: $bb-spacing-small;

  &__overlay {
    position: absolute;
    right: $bb-spacing-small;
    top: v-bind(overlayY);

    .bb-button {

      &__element {
        background-color: transparent;
      }

      svg {
        fill: $bb-color-lynch;
        height: 80%;
      }
    }
  }
}
</style>
