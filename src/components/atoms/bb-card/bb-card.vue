<template>
  <div class="bb-card">
    <slot />
  </div>
</template>

<style lang="scss">
.bb-card {
  max-width: 10rem;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  column-gap: $bb-spacing-small;
  cursor: default;
  outline: none;
  user-select: none;
  padding: $bb-spacing-small;
  margin: $bb-spacing-small;
  background-color: $bb-bg-color-1;
  border-radius: $bb-border-radius-regular;

  &:focus,
  &:hover {
    background-color: lighten($bb-bg-color-1, $bb-lighten-light);
  }
}
</style>