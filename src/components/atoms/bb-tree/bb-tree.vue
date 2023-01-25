<template>
  <div class="bb-tree">
    <q-tree
      :nodes="simple"
      node-key="uuid"
      no-connectors
      v-model:selected="selectedNode"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineEmits } from 'vue';

const emits = defineEmits(['node-selected'])

const selectedNode = ref(null)

watch(selectedNode, (value: unknown) => {
  emits('node-selected', value)
})

const simple = [
        {
          uuid: '0',
          label: 'Satisfied customers (with avatar)',
          avatar: 'https://cdn.quasar.dev/img/boy-avatar.png',
          children: [
            {
              uuid: '01',
              label: 'Good food (with icon)',
              img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
              children: [
                {
                  uuid: '011',
                  label: 'Quality ingredients'
                },
                {
                  uuid: '012',
                  label: 'Good recipe'
                }
              ]
            },
            {
              uuid: '1',
              label: 'Good service (disabled node with icon)',
              icon: 'room_service',
              disabled: true,
              children: [
                { uuid: '11', label: 'Prompt attention' },
                { uuid: '12',  label: 'Professional waiter' }
              ]
            },
            {
              uuid: '2',
              label: 'Pleasant surroundings (with icon)',
              icon: 'photo',
              children: [
                {
                  uuid: '21',
                  label: 'Happy atmosphere (with image)',
                  img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png'
                },
                { uuid: '22',  label: 'Good table presentation' },
                { uuid: '23',  label: 'Pleasing decor' }
              ]
            }
          ]
        }
      ]
</script>
