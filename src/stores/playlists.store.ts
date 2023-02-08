import { iMetadata } from '../services/interfaces/file.interface';
import { v4 as uuid } from 'uuid'
import { defineStore } from 'pinia';
import { iPlaylist } from '../services/interfaces/playlist.interface'
import { iFile } from '../services/interfaces/file.interface'
import { usePlaylistsService } from '../services/playlists/playlists.service'
import { readMetadata } from '../services/metadata/metadata.service'

let playlistService = null

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: [] as iPlaylist[] | null,
    filter: null,
    impageCache: {},
    selectedPlaylist: null as iPlaylist | null,
    currentPlaylist: null as iPlaylist | null,
  }),
  getters: {
    filteredPlaylists: (state) => {
      let result: iPlaylist[] | null = state.playlists
      if (state.filter) {
        result = state.playlists?.filter(p => p.label.toLowerCase().indexOf(state.filter.toLowerCase()) > -1)
      }
      return result
    }
  },
  actions: {
    async init() {
      if (!playlistService) {
        playlistService = new usePlaylistsService()
        await playlistService.init()
      }
      try {
        this.playlists = await playlistService.readAll()
      } catch (error) {
        console.error('ERROR playlist service init : ', error)
      }
    },
    async create(playlist: iPlaylist) {
      if (!playlistService) {
        playlistService = new usePlaylistsService()
        await playlistService.init()
      }
      if (!this.playlists) return

      try {
        await playlistService.create(playlist)
      } catch (error) {
        console.error('ERROR playlist service create #1 : ', error)
      }

      let newPlaylist: iPlaylist | null = null
      try {
        newPlaylist = await playlistService.findByUUID(playlist.uuid)
      } catch (error) {
        console.error('ERROR playlist service create #2 : ', error)
      }

      if (!newPlaylist) return
      else this.playlists.push(newPlaylist)

      try {
        const idx = this.playlists.findIndex(p => p.uuid === newPlaylist?.uuid)
        this.playlists[idx] = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service create #2 : ', error)
      }
    },
    async delete(playlist: iPlaylist) {
      if (!playlistService) {
        playlistService = new usePlaylistsService()
        await playlistService.init()
      }
      if (!this.playlists) return

      this.playlists.push(playlist as never)
      try {
        await playlistService.delete(playlist.uuid)
      } catch (error) {
        console.error('ERROR playlist service delete : ', error)
      }
    },
    async formatFile(fileToFormat: iFile) {
      if (!playlistService) {
        playlistService = new usePlaylistsService()
        await playlistService.init()
      }
      let metadata: iMetadata | null = null
      try {
        metadata = await readMetadata(fileToFormat.path)
      } catch (error) {
        console.error('readMetadata error', fileToFormat.label, error)
        throw error
      }
      console.log('fileToFormat', fileToFormat)
      console.log('label', metadata?.tags?.title || fileToFormat.name)
      const file: iFile = {
        uuid: uuid(),
        label: metadata?.tags?.title || fileToFormat.name,
        path: fileToFormat.path,
        type: fileToFormat.type,
        size: fileToFormat.size,
        album: metadata?.tags?.album,
        artist: metadata?.tags?.artist,
        genre: metadata?.tags?.genre,
      }

      return file
    },
    async addFilesToPlaylist(files: iFile[], playlist: iPlaylist) {
      if (!playlistService) {
        playlistService = new usePlaylistsService()
        await playlistService.init()
      }
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files)

      const newPlaylist: iPlaylist = { ...playlist }
      await Promise.all(formattedFiles.map(async (file) => {
        if (!newPlaylist.files) newPlaylist.files = []
        const result = await this.formatFile(file)

        if (result) {

          let audio: HTMLAudioElement | null = new Audio(result.path)
          const getDuration = () => {
            return new Promise((resolve) => {
              if (audio) {
                audio.onloadedmetadata = function (data) {
                  resolve(data?.currentTarget?.duration);
                }
              }
            })
          }

          try {
            result.time = await getDuration()
            audio = null
          } catch (error) {
            console.error('getDuration error', error)
          }

          newPlaylist.files.push(result)
        }
      }))

      try {
        await playlistService.update(newPlaylist.key, newPlaylist)
        this.selectedPlaylist = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service addFilesToPlaylist #1 : ', error)
      }

      try {
        const idx = this.playlists?.findIndex(p => p.uuid === newPlaylist.uuid)
        this.playlists[idx] = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service addFilesToPlaylist #2 : ', error)
      }
    },
  },
});
