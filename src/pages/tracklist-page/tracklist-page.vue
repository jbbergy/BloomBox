<template>
  <div class="tracklist-page">
    <BBTracklistHeader />
    <BBTracklistActions />
    <BBTracklist />
  </div>
</template>

<script lang="ts" setup>
import BBTracklistHeader from 'src/components/domains/playlists/headers/bb-tracklist-header.vue'
import BBTracklistActions from 'src/components/domains/playlists/actions/bb-tracklist-actions.vue'
import BBTracklist from 'src/components/domains/playlists/bb-tracklist.vue'
</script>
