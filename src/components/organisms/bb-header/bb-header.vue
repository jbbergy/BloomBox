<template>
  <div class="bb-header">
      <inline-svg
        :src="IconLogo"
        aria-label="Logo Bloombox"
      />
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import IconLogo from '../../../assets/img/logo.svg'

</script>

<style lang="scss">
.bb-header {
  padding: $bb-spacing-small;

  svg {
    height: 2rem;
    width: 7rem;
  }
}
</style>
