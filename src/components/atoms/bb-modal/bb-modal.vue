<template>
  <BBFocusTrap>
    <div class="bb-modal" id="BBModal">
        <div class="bb-modal__container" id="BBModalContainer">
            <div class="bb-modal__title">
              <slot name="title" />
            </div>
            <div class="bb-modal__body">
              <slot />
            </div>
            <div class="bb-modal__actions">
              <slot name="actions" />
            </div>
        </div>
    </div>
  </BBFocusTrap>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import BBFocusTrap from '../bb-focus-trap/bb-focus-trap.vue'

const modalEl = ref<HTMLElement | null>()
const containerEl = ref<HTMLElement | null>()

onMounted(() => {
  modalEl.value = document.getElementById('BBModal')
  containerEl.value = document.getElementById('BBModalContainer')

  modalEl?.value.classList.add('bb-modal--open')
  containerEl?.value.classList.add('bb-modal__container--open')
})
</script>

<style lang="scss">
.bb-modal {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(#000, 50%);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  &--open {
    opacity: 1;
  }

  &__container {
    background-color: $dark;
    min-width: 50%;
    max-width: calc(100% - #{$bb-spacing-regular});
    min-height: 25%;
    max-height: calc(100% - #{$bb-spacing-regular});
    border-radius: $bb-border-radius-regular;
    padding: $bb-spacing-small;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transform: translateY(-4rem);
    transition: transform 0.3s ease;

    &--open {
      transform: translateY(0);
    }
  }

  &__title {
    font-size: $bb-font-size-large;
    font-weight: $bb-font-weight-bold;
  }

  &__body {
    padding: $bb-spacing-small 0;
  }

  &__actions {
    display: flex;
    column-gap: $bb-spacing-small;
    justify-content: flex-end;
  }
}
</style>