<template>
  <div
    v-if="showDebug"
    class="data-debug"
  >
    <button @click="showDebug = false">Close</button>
    <br>
    isLoading {{ globalStore.isLoading }}<br>
    loadingTarget {{ globalStore.loadingTarget }}<br>
    loadingMessagea {{ globalStore.loadingMessage }}<br>
  </div>
  <q-layout view="hHh lpR lFf">

    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <BBHeader />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      class="custom-scrollbar"
    >
      <BBSidebar />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <BBPlayer />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
  <teleport to="body">
    <BBModal
      v-if="globalStore.isLoading && globalStore.loadingTarget === 'global'"
      class="global-loading-modal"
    >
      <template #title>
        {{ globalStore.loadingMessage || 'Chargement...' }}
      </template>
      <template #default>
        <div class="global-loading-modal__body">
          <inline-svg
            :src="SvgLoading"
            aria-label="Chargment"
          />
        </div>
      </template>
    </BBModal>
  </teleport>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import SvgLoading from 'src/assets/loading.svg'
import { useGlobalStore } from 'src/stores/global.store'
import BBHeader from 'src/components/domains/header/bb-header.vue'
import BBSidebar from 'src/components/domains/library/bb-sidebar.vue'
import BBPlayer from 'src/components/domains/player/bb-player.vue'
import BBModal from 'src/components/atoms/bb-modal/bb-modal.vue'
import { ref, watch } from 'vue'

const showDebug = ref(false)

const globalStore = useGlobalStore()
const leftDrawerOpen = ref(true)

watch(leftDrawerOpen, () => {
  if (!leftDrawerOpen.value) leftDrawerOpen.value = true
})

</script>

<style lang="scss">
.data-debug {
  position: fixed;
  top: 2.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem;
  width: 500px;
  z-index: 2100;
  overflow: auto;
  height: 450px;

  button {
    pointer-events: all;
  }
}
</style>
