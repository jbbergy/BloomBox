<template>
  <div
      v-if="hasPlayists"
      class="bb-tree"
  >
    <div
      v-for="playlist in playlistsStore.filteredPlaylists"
      :key="playlist.uuid"
      :id="playlist.uuid"
      :class="[
        'bb-tree__item',
        currentPlaylistId === playlist.uuid && 'bb-tree__item--selected'
      ]"
      @click="onSelectNode(playlist)"
      @dblclick="onSelectNode(playlist, true)"
      @keypress.space="onSelectNode(playlist)"
      @keypress.enter="onSelectNode(playlist)"
      tabindex="0"
    >
      <div class="bb-tree__img">
        <img :src="getPlaylistCover(playlist)"/>
      </div>
      <div class="bb-tree__label">
        {{ playlist.label }}
      </div>
      <div class="bb-tree__actions">
        <template v-if="selectedNode?.uuid === playlist.uuid">
          <BBButton @click="onDeletePlaylist(playlist.uuid)" no-bg>
            <inline-svg :src="IconTrash" aria-label="Supprimer la playlist" />
          </BBButton>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount,onMounted, watch, ref } from 'vue'
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import IconTrash from '../../../assets/icons/i-trash.svg'
import ImgCover from '../../../assets/img/cover.jpg'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { PlaylistsService } from '../../../services/playlists/playlists.service'
import { useRouter } from 'vue-router'
import { iPlaylist } from '../../../services/interfaces/playlist.interface'
import { iFile } from '../../../services/interfaces/file.interface'
import { getRandomValue } from '../../../utils/random'
import { CacheImageService } from '../../../services/cache/images.cache.service'
const selectedNode = ref<iPlaylist>()

const router = useRouter()
const playlistsStore = usePlaylistsStore()
const playQueueStore = usePlayQueueStore()
const playlistsService = new PlaylistsService()
const cacheImageService = new CacheImageService()

watch(selectedNode, (node: iPlaylist) => {
  if (!node || !playlistsStore.playlists) return
  const playlist: iPlaylist | null = playlistsStore.playlists.find((p) => p.uuid === node.uuid) || null
  playlistsStore.selectedPlaylist = playlist
  router.push({ name: 'tracklist' })
})

const hasPlayists = computed(() => {
  if (playlistsStore.filteredPlaylists) {
    return playlistsStore.filteredPlaylists?.length > 0
  }
  return null
})

const currentPlaylistId = computed(() => playlistsStore.currentPlaylist?.uuid)

const getPlaylistCover = (playlist: iPlaylist) => {
  if (playlist.files && playlist.files.length > 0 && playlist.files[0].album) {
    const img = cacheImageService.getFromCache(playlist.files[0].album)
    return img
  }
  return ImgCover
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
