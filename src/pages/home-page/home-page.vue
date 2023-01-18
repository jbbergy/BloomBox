<template>
  <q-page class="row items-center justify-evenly">
    main page
  </q-page>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { PlaylistsService } from '../../services/playlists/playlists.service'
import { iPlaylist } from '../../services/interfaces/playlist.interface'
import { v4 } from 'uuid';

let playlistService: PlaylistsService | null = null

onMounted(async () => {
  console.log('onMounted home')
  playlistService = new PlaylistsService()
  const playlist: iPlaylist = {
    uuid: v4(),
    path: 'H:/MUSIQUE/BO',
    isDir: true,
    isSymLink: false,
    label: 'BO',
    name: 'BO'
  }
  try {
    await playlistService.create(playlist)
  } catch (error) {
    console.error('create', error)
  }

  try {
    const list = await playlistService.readAll()
    console.log('liste', list)
  } catch (error) {
    console.error('readAll', error)
  }

  // try {
  //   await playlistService.deleteDatabase()
  // } catch (error) {
  //   console.error('deleteDatabase', error)
  // }

})
</script>
