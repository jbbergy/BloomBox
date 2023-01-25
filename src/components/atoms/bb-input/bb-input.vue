<template>
  <div class="bb-input">
    <input type="text" class="bb-input__element"/>
  </div>
</template>

<style lang="scss">
.bb-input {
  width: 100%;

  &__element {
    width: 100%;
    height: $bb-height-regular;
    background-color: $bb-bg-color-1;
    padding: 0 $bb-spacing-xsmall;
    border:0;
    border-radius: 0.3rem;
    color: $bb-text-color-1;
    font-size: $bb-font-size-large;
    line-height: $bb-font-size-large;
    outline: none;

    &:hover {
      background-color: lighten($bb-bg-color-1, $bb-lighten-light);
    }

    &:focus {
      background-color:$bb-bg-color-2;
      color: $bb-text-color-2;
    }
  }
}
</style>
