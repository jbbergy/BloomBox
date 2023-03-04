<template>
  <div
    class="bb-focus-trap"
    ref="container"
    @focusin="handleFocusin"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

let container = ref<HTMLDivElement | null>(null)
let focusableElements: NodeListOf<HTMLElement>
let firstFocusableElement: HTMLElement
let lastFocusableElement: HTMLElement

onMounted(() => {
  if (container.value) {
    focusableElements = container.value.querySelectorAll<HTMLElement>(
      'button, input'
    )
    firstFocusableElement = focusableElements[0]
    lastFocusableElement = focusableElements[focusableElements.length - 1]
  }
});

function handleFocusin(event: FocusEvent) {
  if (
    container.value 
    && event.target !== container.value 
    && !container.value.contains(event.target as Node)
  ) {
    firstFocusableElement.focus()
  }
}

function handleKeydown(event: KeyboardEvent) {
  const isTabPressed = event.code === 'Tab'

  if (!isTabPressed) {
    return
  }

  if (event.shiftKey) {
    if (document.activeElement === firstFocusableElement) {
      lastFocusableElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastFocusableElement) {
      firstFocusableElement.focus();
      event.preventDefault();
    }
  }
}
</script>

