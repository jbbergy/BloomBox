<template>
  <div class="bb-context-menu">
    <BBButton
      @click="showItems = !showItems"
      no-bg
    >
      <div class="bb-context-menu__dots">
        <div class="bb-context-menu__dot"></div>
        <div class="bb-context-menu__dot"></div>
        <div class="bb-context-menu__dot"></div>
      </div>
    </BBButton>
    <div
      v-if="showItems"
      class="bb-context-menu__panel"
    >
      <div
        tabindex="0"
        class="bb-context-menu__panel-item"
        v-for="item in props.items"
        :key="item.label"
        @click="callFunction(item.func)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlaylistsStore } from '../../../stores/playlists.store'
import BBButton from '../../atoms/bb-button/bb-button.vue'

const showItems = ref(false)

const playlistsStore = usePlaylistsStore()

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const callFunction = async (func: CallableFunction) => {
  showItems.value = false
  if (!playlistsStore.selectedPlaylist?.uuid) return
  await func(playlistsStore.selectedPlaylist.uuid)
}
</script>

<style lang="scss">
.bb-context-menu {
  $self: &;
  position: relative;

  &__panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: fit-content;
    border-radius: $bb-border-radius-regular;
    background-color: $dark;
    z-index: 2000;
    right: 0;

    &-item {
      width: 100%;
      padding: $bb-spacing-small $bb-spacing-regular;
      color: $bb-text-color-4;
      font-weight: $bb-font-weight-bold;

      &:hover {
        background-color: $bb-bg-color-1;
      }
    }
  }
  
  &__dots {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 0.25rem;
  }

  &__dot {
    $dot-size: 0.3rem;

    width: $dot-size;
    height: $dot-size;
    border-radius: 999px;
    background-color: $bb-bg-color-5;
  }

  &:hover {
    #{$self}__dot {
      background-color: $bb-bg-color-4;
    }
  }
}
</style>