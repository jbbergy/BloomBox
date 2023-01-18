<template>
  <q-layout view="hHh lpR lFf">

    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          BloomBox
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left">
      Playlists
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-dark text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>player</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(true)
</script>
