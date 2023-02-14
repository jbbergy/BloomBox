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
    <div
      v-if="isCreateModalOpen"
      class="bb-playlist-create__modal"
    >
      <BBInput
        v-model="playlistName"
        :focus-when-ready="true"
        placeholder="Nom de la playlist"
        @press:enter="createPlaylist"
      />
      <BBButton
        class="bb-playlist-create__btn--confirm"
        @click="createPlaylist"
      >
        <inline-svg
          :src="IconConfirm"
          aria-label="Créer la playlist"
        />
      </BBButton>
      <BBButton
        class="bb-playlist-create__btn--abort"
        @click="hideCreateModal"
      >
        <inline-svg
          :src="IconAbort"
          aria-label="Annuler la création de la playlist"
        />
      </BBButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuid } from 'uuid'
import InlineSvg from 'vue-inline-svg'
import { ref } from 'vue';
import { usePlaylistsStore } from '../../../stores/playlists.store'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import BBInput from '../../atoms/bb-input/bb-input.vue'
import IconConfirm from '../../../assets/icons/i-confirm.svg'
import IconAbort from '../../../assets/icons/i-abort.svg'
import IconPlus from '../../../assets/icons/i-plus.svg'
import CoverImg from '../../../assets/img/cover.jpg'

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

  playlistsStore.create({
    label: playlistName.value,
    img: CoverImg,
    uuid: uuid(),
  })
  hideCreateModal()
}

</script>

<style lang="scss">
.bb-playlist-create {
  position: relative;
  padding: 0 $bb-spacing-small;
  font-size: $bb-font-size-large;

  &__modal {
    position: absolute;
    top: 0;
    right: $bb-spacing-small;
    left: $bb-spacing-small;
    z-index: 100;
    display: flex;
    flex-direction: row;
    column-gap: $bb-spacing-small;
    background-color: $bb-color-masala;
    padding: $bb-spacing-small;
    border-radius: $bb-border-radius-regular;
    border: 1px solid $bb-color-Feijoa;

  }

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
