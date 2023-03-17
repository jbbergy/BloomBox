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
import ImgCover from '../assets/img/cover.jpg'
import ImgFavCover from '../assets/img/fav-cover.png'

const FAV_LABEL = 'Titres likés'
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
    const imgBase64 = `data:${pictureData?.format};base64,${image}`
    return imgBase64.replace(';;', ';')
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
    sortOrder: 'ORDER' as string,
  }),
  getters: {
    filteredPlaylists: (state) => {
      if (!state.playlists) return []
      let result: iPlaylist[] = [...state.playlists]

      result = result.map((playlist: iPlaylist, index: number) => {
        if (!playlist.order) {
          return { ...playlist, order: index }
        }
        return playlist
      })

      if (state.filter) {
        result = result?.filter(p => p.label.toLowerCase().indexOf(state.filter.toLowerCase()) > -1)
      }

      if (state.sortOrder && result) {
        if (state.sortOrder === 'ASC') {
          result = result.sort((a, b) => a.label.localeCompare(b.label))
        } else if (state.sortOrder === 'DESC') {
          result = result.sort((a, b) => b.label.localeCompare(a.label))
        } else {
          result = result.sort((a, b) => a.order - b.order)
        }
      }
      return result
    },
    getPlaylistCover: () => (playlist: iPlaylist) => {
      if (playlist.label === FAV_LABEL) return playlist.img

      const labelCover = cacheImageService.getFromCache(playlist.label)
      let albumCover = null
      if (playlist.files?.length || 0 > 0) {
        const firstfile = playlist.files[0] as iFile
        albumCover = cacheImageService.getFromCache(firstfile.album)
      }
      const cover = labelCover || albumCover
      const img = cover || ImgCover
      return img
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

      const hasFavPlaylist = this.playlists?.findIndex((playlist: iPlaylist) => playlist.label === FAV_LABEL)
      if (hasFavPlaylist === -1) {
        const favPlaylist: iPlaylist = {
          label: FAV_LABEL,
          order: -1,
          uuid: uuid(),
          img: ImgFavCover
        }
        this.create(favPlaylist)
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
    addFileToFav(file: iFile) {
      const favPlaylistIndex = this.playlists?.findIndex((playlist: iPlaylist) => playlist.label === FAV_LABEL)

      if (favPlaylistIndex > -1) {
        if (!this.playlists[favPlaylistIndex || 0].files) {
          this.playlists[favPlaylistIndex || 0].files = [] as iFile[]
        }
        this.playlists[favPlaylistIndex || 0].files?.push(file)
      }
    },
    removeFilefromFav(file: iFile) {
      const favPlaylistIndex = this.playlists?.findIndex((playlist: iPlaylist) => playlist.label === FAV_LABEL)

      if (favPlaylistIndex > -1) {
        const playlist: iPlaylist = this.playlists[favPlaylistIndex || 0] as iPlaylist
        const files: iFile[] = playlist.files || [] as iFile[]

        if (files.length === 0) return

        const fileIndex = files.findIndex((f: iFile) => f.uuid === file.uuid)

        if (fileIndex > -1) {
          files.splice(fileIndex, 1)
          playlist.files = files
        }
      }
    },
    async addFilesToPlaylist(files: iFile[]) {
      this.refreshCovers = false
      if (!playlistService) {
        playlistService = new PlaylistsService()
        await playlistService.init()
      }
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files)

      const newPlaylist: iPlaylist = { ...this.selectedPlaylist }
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
    async updateCover(coverFile) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        let base64 = null
        reader.onload = (fileLoadedEvent) => {
          base64 = fileLoadedEvent.target.result
          cacheImageService.addToCache(this.selectedPlaylist?.label, base64)
          cacheImageService.setForceUpdate()
          resolve(base64)
        }
        reader.readAsDataURL(coverFile)
      })
    }
  },
})
