<template>
  <div
    class="bb-tracklist-header"
    v-if="isSearchHeader || playlistsStore.selectedPlaylist"
  >
    <img
      v-if="!isSearchHeader"
      :src="playlistCover"
      class="bb-tracklist-header__cover"
    />
    <div class="bb-tracklist-header__text">
      <h1 class="bb-tracklist-header__title">
        <template v-if="isSearchHeader">
          {{ title }}
        </template>
        <template v-else-if="playlistsStore.selectedPlaylist">
          {{ playlistsStore.selectedPlaylist.label }}
        </template>
      </h1>
      <div class="bb-tracklist-header__infos">
        <template v-if="!isSearchHeader && nbFiles > 0">
          {{ nbFiles }}&nbsp;{{ nbFiles > 1 ? 'Titres' : 'Titre' }}
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { usePlaylistsStore } from '../../../stores/playlists.store'

const props = defineProps({
  isSearchHeader: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: null,
  }
})

const playlistsStore = usePlaylistsStore()
const playlistCover = ref()

const nbFiles = computed(() => {
  if (props.title) return 0
  return playlistsStore.selectedPlaylist?.files?.length || 0
})

watch(
  () => playlistsStore.selectedPlaylist,
  async (value) => {
    if (value) {
      playlistCover.value = await playlistsStore.getPlaylistCover(value)
    }
  },
  {
    immediate: true
  }
)

</script>

<style lang="scss">
.bb-tracklist-header {
  padding: $bb-spacing-small;
  display: flex;
  align-items: flex-start;
  column-gap: $bb-spacing-small;

  &__text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: $bb-spacing-small;
  }

  &__title {
    font-size: $bb-font-size-xlarge;
    line-height: $bb-font-size-xlarge;
    text-transform: capitalize;
    margin: 0;
    font-weight: $bb-font-weight-regular;
  }

  &__infos {
    font-size: $bb-font-size-small;
    line-height: $bb-font-size-small;
    font-weight: $bb-font-weight-regular;
    padding-left: $bb-spacing-xsmall;
  }

  &__cover {
    height: 5.282rem;
    border-radius: $bb-border-radius-regular;
  }
}
</style>
