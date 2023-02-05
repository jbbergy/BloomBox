<template>
  <div class="bb-transport-button">
    <button
      :class="[
        'bb-transport-button__element',
        `bb-transport-button__element--${size}`
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
    background-color: $bb-bg-color-2;
    border: 0;
    border-radius: 999px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;

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
  }

}
</style>
