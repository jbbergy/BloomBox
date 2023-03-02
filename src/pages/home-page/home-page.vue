<template>
  <q-page class="home-page">
  <div class="home-page__wrapper">
    <img
      class="home-page__illustration"
      :src="cover"
    />
  </div>
  </q-page>
</template>

<script lang="ts" setup>
import Cover1 from '../../assets/img/cover-1.png'
import Cover2 from '../../assets/img/cover-2.png'
import Cover3 from '../../assets/img/cover-3.png'
import { computed } from 'vue'
import { getRandomValue } from '../../utils/random.ts'

const cover = computed(() => {
  const covers = [
    Cover1,
    Cover2,
    Cover3
  ]

  const pos = getRandomValue(0, covers.length - 1)

  return covers[pos]
})
const cssCover = computed(() => `url('${cover.value}')`)
</script>

<style lang="scss">
.home-page {
  position: relative;
  background:v-bind(cssCover) center no-repeat;
  background-size: cover;
  background-position: center;

  &__wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(8px);
  }
}
</style>
