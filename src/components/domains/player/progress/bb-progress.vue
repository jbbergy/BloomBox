<template>
  <div class="bb-progress">
    <div class="bb-progress__time">{{ elapsedTime.m }}:{{ elapsedTime.s }}</div>
    <input
      :value="progressBarValue"
      @input="onSeek"
      @mousedown="updateValue = false"
      @mouseup="updateValue = true"
      type="range"
      step="0.1"
      min="0"
      max="100"
      :disabled="!isPlayingFile"
      class="bb-progress__control"
    />
    <div class="bb-progress__time">{{ fileDuration.m }}:{{ fileDuration.s }}</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue'
import { usePlayerStore } from 'src/stores/player.store'
import { usePlayQueueStore } from 'src/stores/play-queue.store'

const updateValue = ref(true)
const seek = ref(0)
const progressBarValue = ref(0)
const doUpdateSeek = ref<number | null>(null)
const seekValue = ref(0)

const playerStore = usePlayerStore()
const playQueueStore = usePlayQueueStore()

onMounted(() => {
  updateCurrenttime()
})

watch(updateValue, () => {
  if (!!doUpdateSeek.value) {
    const fileTime = playQueueStore?.playingFile?.time
    seekValue.value = fileTime * (doUpdateSeek.value / 100)
    const newTime = seekValue.value > fileTime ? fileTime : seekValue.value
    playerStore.currentInstance?.seek(newTime)
    doUpdateSeek.value = null
  }
})

const updateCurrenttime = () => {
  if (playerStore.currentInstance && updateValue.value) {
    seek.value = playerStore.currentInstance.getInstance()?.getCurrentTime() || 0
    updateProgressBarValue()
  }
  requestAnimationFrame(updateCurrenttime)
}

const getFileDuration = (duration) => {
  if (!duration) return {
    m: 0,
    s: '00'
  }
  const minuts = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return {
    m: minuts,
    s: seconds < 10 ? `0${seconds}` : seconds,
  }
}

const fileDuration = computed(() => {
  return getFileDuration(playQueueStore?.playingFile?.time || 0)
})

const elapsedTime = computed(() => {
  return getFileDuration(seek.value)
})

const isPlayingFile = computed(() => !!playQueueStore?.playingFile)

const updateProgressBarValue = () => {
  const duration = playQueueStore?.playingFile?.time || 0
  if (duration > 0) {
    const result = (seek.value / duration) * 100
    progressBarValue.value = result.toFixed(1)
  }
}

const onSeek = (event) => {
  doUpdateSeek.value = event?.target?.value
}

</script>

<style lang="scss">
.bb-progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  column-gap: $bb-spacing-regular;
  font-size: $bb-font-size-regular;

  &__control {
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
