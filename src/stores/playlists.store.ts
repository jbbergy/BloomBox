import { defineStore } from 'pinia';
import { iPlaylist } from '../services/interfaces/playlist.interface'
import { usePlaylistsService } from '../services/playlists/playlists.service'

const playlistService: PlaylistsService = new usePlaylistsService()

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: [],
    selectedPlaylist: null
  }),
  getters: {
    getPlaylists: (state) => state.playlists?.map(p => {
      const val: iPlaylist = {
        uuid: p.uuid,
        label: p.label,
        img: p.img,
        children: p.children,
      }
      return val
    })
  },
  actions: {
    async init() {
      try {
        this.playlists = await playlistService.readAll()
      } catch (error) {
        console.error('ERROR playlist service init : ', error)
      }
    },
    async create(playlist: iPlaylist) {
      this.playlists.push(playlist as never)
      try {
        await playlistService.create(playlist)
      } catch (error) {
        console.error('ERROR playlist service create : ', error)
      }
    },
    async delete(playlist: iPlaylist) {
      this.playlists.push(playlist as never)
      try {
        await playlistService.delete(playlist.uuid)
      } catch (error) {
        console.error('ERROR playlist service delete : ', error)
      }
    },
  },
});
