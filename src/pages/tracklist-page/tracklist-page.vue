<template>
  <div class="tracklist-page">
    <BBTracklistHeader />
    <BBTracklistActions />
    <BBTracklist />
  </div>
</template>

<script lang="ts" setup>
import BBTracklistHeader from '../../components/organisms/bb-tracklist-header/bb-tracklist-header.vue'
import BBTracklistActions from '../../components/organisms/bb-tracklist-actions/bb-tracklist-actions.vue'
import BBTracklist from '../../components/organisms/bb-tracklist/bb-tracklist.vue'
</script>
