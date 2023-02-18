import { iMetadata } from '../services/interfaces/file.interface'
import { Buffer } from 'buffer'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { iPlaylist } from '../services/interfaces/playlist.interface'
import { iFile } from '../services/interfaces/file.interface'
import { PlaylistsService } from '../services/playlists/playlists.service'
import { readMetadata } from '../services/metadata/metadata.service'
import { CacheImageService } from '../services/cache/images.cache.service'

let playlistService: PlaylistsService | null = null
const cacheImageService = new CacheImageService()

const isOlderThanHours = (date: dayjs.Dayjs, hours = 24) => {
  const currentDate = dayjs()
  const difference = currentDate.diff(date, 'hours')
  return difference >= hours
}

const getCoverBase64 = async (filePath: string) => {
  let metadata: iMetadata | null = null
  try {
    metadata = await readMetadata(filePath)
  } catch (error) {
    console.error(error)
  }

  if (!metadata) return null

  const pictureData = metadata?.tags?.picture

  if (pictureData?.data) {
    const image = Buffer.from(pictureData?.data).toString('base64')
    return `data:${pictureData?.format}base64,${image}`
  }
  return null
}

export const usePlaylistsStore = defineStore('playlists', {
  state: () => ({
    playlists: [] as iPlaylist[] | null,
    filter: null,
    impageCache: {},
    selectedPlaylist: null as iPlaylist | null,
    currentPlaylist: null as iPlaylist | null,
    needCacheUpdate: false,
    refreshCovers: false,
    sortOrder: 'ASC',
  }),
  getters: {
    filteredPlaylists: (state) => {
      if (!state.playlists) return []
      let result: iPlaylist[] = state.playlists
      if (state.filter) {
        result = result?.filter(p => p.label.toLowerCase().indexOf(state.filter.toLowerCase()) > -1)
      }
      if (state.sortOrder && result) {
        if (state.sortOrder === 'ASC') {
          result = result.sort((a, b) => a.label.localeCompare(b.label))
        } else if (state.sortOrder === 'DESC') {
          result = result.sort((a, b) => b.label.localeCompare(a.label))
        }
      }
      return result
    }
  },
  actions: {
    async init() {
      this.needCacheUpdate = false

      if (!playlistService) {
        playlistService = new PlaylistsService()
        await playlistService.init()
      }

      const lastUpdateDate = cacheImageService.getLastUpdate()
      if (!lastUpdateDate || (lastUpdateDate && isOlderThanHours(lastUpdateDate))) {
        this.needCacheUpdate = true
      }

      try {
        this.playlists = await playlistService.readAll()
      } catch (error) {
        console.error('ERROR playlist service init : ', error)
      }

      if (this.needCacheUpdate) {
        await this.refreshCache()
      }

    },
    async refreshCache() {
      if (this.playlists && this.playlists?.length > 0) {
        await Promise.all(this.playlists.map(async p => {
          if ((p.files?.length || -1) > 0 && Array.isArray(p.files)) {
            await Promise.all(
              p.files.map(async f => {
                if (f.album && !cacheImageService.getFromCache(f.album)) {
                  const img = await getCoverBase64(f.path)
                  if (img) {
                    cacheImageService.addToCache(f.album, img)
                  }
                }
              })
            )
            cacheImageService.setLastUpdate()
            this.needCacheUpdate = false
          }
        }))
      }
    },
    async create(playlist: iPlaylist) {
      if (!playlistService) {
        playlistService = new PlaylistsService()
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
      cacheImageService.setForceUpdate()
    },
    async delete(playlist: iPlaylist) {
      if (!playlistService) {
        playlistService = new PlaylistsService()
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
    async deleteFile(filetoDelete: iFile) {
      if (!playlistService) {
        playlistService = new PlaylistsService()
        await playlistService.init()
      }
      let idxTodelete = null
      if (
        this.selectedPlaylist
        && this.selectedPlaylist.files
        && Array.isArray(this.selectedPlaylist.files)
        && this.selectedPlaylist.key
      ) {
        idxTodelete = this.selectedPlaylist.files.findIndex(f => f.uuid === filetoDelete.uuid)
        if (idxTodelete > -1) {
          this.selectedPlaylist.files.splice(idxTodelete, 1)
          playlistService.update(this.selectedPlaylist.key, this.selectedPlaylist)
        }
        cacheImageService.setForceUpdate()
        await this.refreshCache()
      }
    },
    async formatFile(fileToFormat: iFile) {
      if (!playlistService) {
        playlistService = new PlaylistsService()
        await playlistService.init()
      }
      let metadata: iMetadata | null = null
      try {
        metadata = await readMetadata(fileToFormat.path)
      } catch (error) {
        console.error('readMetadata error', fileToFormat.label, error)
      }

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
      this.refreshCovers = false
      if (!playlistService) {
        playlistService = new PlaylistsService()
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
                  resolve(data?.currentTarget?.duration)
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
      cacheImageService.setForceUpdate()
      await this.refreshCache()
      this.refreshCovers = true
    },
  },
})
