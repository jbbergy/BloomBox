import { v4 as uuid } from 'uuid'
import { defineStore } from 'pinia';
import { iPlaylist } from '../services/interfaces/playlist.interface'
import { iFile } from '../services/interfaces/file.interface'
import { usePlaylistsService } from '../services/playlists/playlists.service'

const playlistService = new usePlaylistsService()

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
        files: p.files,
        children: p.children,
      }
      return val
    }),
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
        console.error('ERROR playlist service create #1 : ', error)
      }

      let newPlaylist = null
      try {
        newPlaylist = await playlistService.findByUUID(playlist.uuid)
      } catch (error) {
        console.error('ERROR playlist service create #2 : ', error)
      }
      if (!newPlaylist) return
      try {
        const idx = this.playlists.findIndex(p => p.uuid === newPlaylist.uuid)
        this.playlists[idx] = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service create #2 : ', error)
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
    async addFileToPlaylist(files: any[], playlist: iPlaylist) {
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files).map(f => {
        const file: iFile = {
          uuid: uuid(),
          label: f.name,
          path: f.path,
          img: '',
          type: f.type,
          size: f.size
        }
        return file
      })

      const newPlaylist: iPlaylist = { ...playlist }
      newPlaylist.files = formattedFiles

      try {
        await playlistService.update(newPlaylist.key, newPlaylist)
        this.selectedPlaylist = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service addFileToPlaylist #1 : ', error)
      }

      try {
        const idx = this.playlists.findIndex(p => p.uuid === newPlaylist.uuid)
        this.playlists[idx] = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service create #2 : ', error)
      }
    },
  },
});
