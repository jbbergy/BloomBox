<template>
  <div class="bb-input">
    <input
      :id="inputId"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus')"
      @keyup.enter="onPressEnter"
      type="text"
      class="bb-input__element"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuid } from 'uuid'
import { onMounted } from 'vue'

const inputId = uuid()

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  focusWhenReady: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:modelValue', 'press:enter'])

onMounted(() => {
  if (props.focusWhenReady) {
    const input = document.getElementById(inputId)
    if (input) {
      input.focus()
    }
  }
})

const onPressEnter = () => {
  emits('press:enter')
}
</script>

<style lang="scss">
.bb-input {
  width: 100%;

  &__element {
    width: 100%;
    height: $bb-height-regular;
    background-color: $bb-bg-color-1;
    padding: 0 $bb-spacing-xsmall;
    border: 0;
    border-radius: $bb-border-radius-regular;
    color: $bb-text-color-1;
    font-size: $bb-font-size-regular;
    line-height: $bb-font-size-large;
    outline: none;

    &:hover {
      background-color: lighten($bb-bg-color-1, $bb-lighten-light);
    }

    &:focus {
      background-color: $bb-bg-color-2;
      color: $bb-text-color-2;
      border: 1px solid $bb-element-outline-accent;
    }
  }
}
</style>
