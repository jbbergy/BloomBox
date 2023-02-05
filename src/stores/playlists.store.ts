import { iMetadata } from '../services/interfaces/file.interface';
import { v4 as uuid } from 'uuid'
import { defineStore } from 'pinia';
import { iPlaylist } from '../services/interfaces/playlist.interface'
import { iFile } from '../services/interfaces/file.interface'
import { usePlaylistsService } from '../services/playlists/playlists.service'
import { readMetadata } from '../services/metadata/metadata.service'

const playlistService = new usePlaylistsService()

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: [] as iPlaylist[] | null,
    selectedPlaylist: null as iPlaylist | null,
  }),
  actions: {
    async init() {
      try {
        this.playlists = await playlistService.readAll()
      } catch (error) {
        console.error('ERROR playlist service init : ', error)
      }
    },
    async create(playlist: iPlaylist) {
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
      if (!this.playlists) return

      this.playlists.push(playlist as never)
      try {
        await playlistService.delete(playlist.uuid)
      } catch (error) {
        console.error('ERROR playlist service delete : ', error)
      }
    },
    async formatFile(fileToFormat: iFile) {
      let metadata: iMetadata | null = null
      try {
        metadata = await readMetadata(fileToFormat.path)
      } catch (error) {
        console.error('readMetadata error', fileToFormat.label, error)
        throw error
      }

      if (!metadata) return

      const file: iFile = {
        uuid: uuid(),
        label: metadata?.tags?.title || fileToFormat.label,
        path: fileToFormat.path,
        img: '',
        type: fileToFormat.type,
        size: fileToFormat.size,
        album: metadata?.tags?.album,
        artist: metadata?.tags?.artist,
        genre: metadata?.tags?.genre,
      }

      return file
    },
    async addFilesToPlaylist(files: iFile[], playlist: iPlaylist) {
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files)

      const newPlaylist: iPlaylist = { ...playlist }
      await Promise.all(formattedFiles.map(async (file) => {
        if (!newPlaylist.files) newPlaylist.files = []
        const result = await this.formatFile(file)
        if (result) newPlaylist.files.push(result)
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
        console.error('ERROR playlist service create #2 : ', error)
      }
    },
  },
});
