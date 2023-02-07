<template>
  <div class="bb-volume-control">
    <BBTransportButton @click="isMute = !isMute" no-bg>
      <inline-svg
        :src="soundIcon"
        aria-label="Activer/désactiver le son"
      />
    </BBTransportButton>
    <input
      :value="volume"
      @input="onVolumeChange"
      type="range"
      step="0.01"
      min="0"
      max="1"
      :disabled="!isFileLoaded"
      class="bb-volume-control__slider"
    />
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg';
import { computed, ref, watch } from 'vue'
import BBTransportButton from '../../../components/atoms/bb-transport-button/bb-transport-button.vue'
import { usePlayQueueStore } from '../../../stores/play-queue.store'
import { usePlayerStore } from '../../../stores/player.store'
import IconSoundUp from '../../../assets/icons/i-sound-up.svg'
import IconSoundOff from '../../../assets/icons/i-sound-off.svg'

const playQueueStore = usePlayQueueStore()
const playerStore = usePlayerStore()

const isMute = ref(false)
const volumeBackup = ref(0)

const soundIcon = computed(() => isMute.value ? IconSoundOff : IconSoundUp)

const isFileLoaded = computed(() => !!playQueueStore.playingFile )

const volume = computed(() => playerStore?.defaultVolume || 0)

watch(isMute, (value) => {
  if (value) {
    volumeBackup.value = playerStore?.defaultVolume
    playerStore.defaultVolume = 0
  } else {
    playerStore.defaultVolume = volumeBackup.value
  }
})

watch(volume, (value) => {
  playerStore.currentInstance?.setVolume(value)
})

const onVolumeChange = (event) => {
  const newVolume = event?.target?.value || 0
  console.log('onVolumeChange', newVolume)
  if (playerStore.currentInstance) {
    playerStore.defaultVolume = newVolume
  }
}

</script>

<style lang="scss">
.bb-volume-control {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  &__button {
    background: transparent;
    border: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      height: 100%;
      color: #fff;
    }
  }
  &__slider {
    width: 100%;
    -webkit-appearance: none;
    background: transparent;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 0.75rem;
      width: 0.75rem;
      border-radius: 999px;
      transform: translateY(-0.25rem);
      background-color: $bb-scrollbar-thumb-bg;
      transition: transform 0.2s ease-in-out;
    }

    &::-webkit-slider-runnable-track {
      -webkit-appearance: none;
      height: 0.25rem;
      background-color: $bb-scrollbar-track-bg;
      border-radius: 999px;
    }

    &:hover {
      &::-webkit-slider-thumb {
        background-color: $bb-text-color-3;
        transform: scale(1.5) translateY(-25%);
      }
    }
  }
}
</style>
