<template>
  <div class="bb-button">
    <button class="bb-button__element">
      <slot />
    </button>
  </div>
</template>

<style lang="scss">
.bb-button {

  &__element {
    height: $bb-height-regular;
    width: $bb-height-regular;
    padding: $bb-spacing-small;
    border: 0;
    background-color: $bb-bg-color-1;
    border-radius: 0.3rem;
    color: $bb-text-color-1;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: lighten($bb-bg-color-1, $bb-lighten-light);
    }
  }
}
</style>
