<template>
  <div class="bb-button">
    <button :class="[
    'bb-button__element',
    noBg && 'bb-button__element--no-bg',
    ]">
      <slot />
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  noBg: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss">
.bb-button {
  &__element {
    height: $bb-height-regular;
    width: 100%;
    min-width: $bb-height-regular;
    padding: $bb-spacing-small;
    border: 0;
    border-radius: $bb-border-radius-regular;
    display: flex;
    column-gap: $bb-spacing-small;
    justify-content: center;
    align-items: center;
    outline: none;
    color: $bb-text-color-1;
    background-color: $bb-bg-color-1;
    font-size: $bb-font-size-regular;
    font-weight: $bb-font-weight-bold;
    text-transform: uppercase;

    &:hover {
      background-color: lighten($bb-bg-color-1, $bb-lighten-light);
    }

    &:focus {
      border: 1px solid $bb-element-outline-accent;
    }

    &--no-bg {
      background-color: transparent;
    }

    svg {
      height: 100%;
      fill: $bb-color-lynch;
    }
  }
}
</style>
