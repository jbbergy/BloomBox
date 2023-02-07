<template>
  <div class="bb-transport-button">
    <button
      :class="[
        'bb-transport-button__element',
        `bb-transport-button__element--${size}`,
        noBg && 'bb-transport-button__element--no-bg',
        isActive && 'bb-transport-button__element--is-active'
      ]"
    >
      <slot />
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  size: {
    type: String,
    default: 'regular',
    validator: (value) => ['regular', 'large'].includes(value)
  },
  noBg: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  }
})
</script>

<style lang="scss">
.bb-transport-button {
  $size-regular: 2.5rem;
  $size-large: 3rem;

  display: inline-block;
  padding: $bb-spacing-xsmall;

  &__element {
    position: relative;
    background-color: $bb-bg-color-2;
    border: 0;
    border-radius: 999px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: $bb-text-color-3;
    }

    &--regular {
      width: $size-regular;
      height: $size-regular;

      svg {
        height: $size-large / 2.5;
        fill: $bb-text-color-2;
      }
    }

    &--large {
    width: $size-large;
    height: $size-large;

      svg {
        height: $size-large / 2;
        fill: $bb-text-color-2;
      }
    }

    &--no-bg {
      background-color: transparent;

      svg {
        fill: $bb-text-color-4;
        color: $bb-text-color-4;
      }

      &:hover {
        background-color: rgba($bb-text-color-4, 0.15);
      }
    }

    &--is-active {

      svg {
        fill: $bb-text-color-3;
      }

      &::after {
        position: absolute;
        content: '';
        width: 0.25rem;
        height: 0.25rem;
        background-color: $bb-text-color-3;
        border-radius: 999px;
        bottom: $bb-spacing-xsmall;
      }
    }
  }

}
</style>
