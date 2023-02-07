<template>
  <div class="bb-header">
    <div class="bb-header__app-name">
      <inline-svg
        class="bb-header__logo"
        :src="IconLogo"
        aria-label="Logo Bloombox"
      />
      <div class="bb-header__text">
        loombox
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import IconLogo from '../../../assets/img/logo.svg'

</script>

<style lang="scss">
.bb-header {
  padding: $bb-spacing-small;

  &__text {
    padding-top: 0.75rem;
  }

  &__app-name {
    color: $bb-text-color-3;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;

    svg {
      height: 2rem;
      height: 2rem;
    }
  }
}
</style>
