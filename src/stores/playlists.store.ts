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
import { useGlobalStore } from './global.store'

const FAV_LABEL = 'Titres likés'
let playlistService: PlaylistsService | null = null
const cacheImageService = new CacheImageService()
const globalStore = useGlobalStore()

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
    lastPlaylists: [] as iPlaylist[] | null,
    filter: null as string | null,
    impageCache: {},
    selectedPlaylist: null as iPlaylist | null,
    currentPlaylist: null as iPlaylist | null,
    needCacheUpdate: false,
    refreshCovers: false,
    sortOrder: 'ORDER' as string,
  }),
  getters: {
    searchFilesInPlaylist: (state) => {
      if (!state.filter) return null
      const files: iFile[] = []
      const playlists = state.playlists?.filter((playlist: iPlaylist) => {
        let hasFiles = false
        if (playlist.files && (playlist.files?.length || 0) > 0) {
          const filesToExam = playlist.files as iFile[]
          filesToExam.forEach((file: iFile) => {
            if (
              state.filter && (
                file.label?.toLowerCase()?.trim().startsWith(state.filter.toLowerCase())
                || file.artist?.toLowerCase()?.trim().startsWith(state.filter.toLowerCase())
                || file.album?.toLowerCase()?.trim().startsWith(state.filter.toLowerCase())
              )
            ) {
              hasFiles = true
              file.playlistId = playlist.uuid
              files.push(file)
            }
          })
        }
        return hasFiles
      })
      return {
        playlists,
        files
      }
    },
    sortedPlaylists: (state) => {
      if (!state.playlists) return []
      let result: iPlaylist[] = [...state.playlists]

      result = result.map((playlist: iPlaylist, index: number) => {
        if (!playlist.order) {
          return { ...playlist, order: index }
        }
        return playlist
      })

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
      if (!labelCover && playlist.files?.length || 0 > 0) {
        const firstfile = playlist.files[0] as iFile
        albumCover = cacheImageService.getFromCache(firstfile.album)
      }
      const cover = labelCover || albumCover
      const img = cover || ImgCover
      return img
    }
  },
  actions: {
    addLastPlaylist(playlist: iPlaylist) {
      if (
        !this.lastPlaylists
        || this.lastPlaylists.findIndex(p => p.uuid === playlist.uuid) > -1
      ) {
        return
      }

      this.lastPlaylists?.reverse()
      if ((this.lastPlaylists?.length || 0) > 4) {
        this.lastPlaylists?.shift()
      }
      const newFiles: iFile[] = [playlist.files[0]]
      this.lastPlaylists?.push({ ...playlist, files: newFiles })
      this.lastPlaylists?.reverse()
      localStorage.setItem('lastPlaylists', JSON.stringify(this.lastPlaylists))
    },
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

      const lastPlaylistsFromStorage = localStorage.getItem('lastPlaylists')
      if (lastPlaylistsFromStorage) {
        this.lastPlaylists = JSON.parse(lastPlaylistsFromStorage)
      }
    },
    async refreshCache() {
      globalStore.isLoading = true
      globalStore.loadingMessage = "Chargement...mise à jour du cache"
      globalStore.loadingTarget = 'global'
      if (this.playlists && this.playlists?.length > 0) {
        await Promise.all(this.playlists.map(async (p: iPlaylist) => {
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
      globalStore.isLoading = false
      globalStore.loadingTarget = null
      globalStore.loadingMessage = null
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
        label: metadata?.tags?.title || fileToFormat.name || fileToFormat.label,
        path: fileToFormat.path,
        type: fileToFormat.type,
        size: fileToFormat.size,
        album: metadata?.tags?.album || 'inconnu',
        artist: metadata?.tags?.artist || 'inconnu',
        genre: metadata?.tags?.genre || 'inconnu',
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
    async addFilesToPlaylist(files: iFile[], playlist?: iPlaylist) {
      this.refreshCovers = false
      if (!playlistService) {
        playlistService = new PlaylistsService()
        await playlistService.init()
      }
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files)

      const newPlaylist: iPlaylist = playlist || { ...this.selectedPlaylist }
      let audio: HTMLAudioElement = new Audio()
      await Promise.all(formattedFiles.map(async (file) => {
        if (!newPlaylist.files) newPlaylist.files = []
        let result = null
        try {
          result = await this.formatFile(file)
        } catch (error) {
          console.error(error)
        }

        if (result) {

          if (!audio) {
            audio = new Audio()
          }
          audio.src = result.path
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
    },
    importLibrary(): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'application/json'
        input.multiple = false

        input.onchange = async (e: Event) => {
          if (e?.target?.files && e?.target?.files.length > 0) {
            const fileReader = new FileReader()
            let library = null
            fileReader.onload = async (event) => {
              try {
                library = JSON.parse(event?.target?.result as string) as iPlaylist[] | null
                if (library?.length || 0 > 0) {
                  try {
                    await this.deleteAllPlaylists(true)
                    this.playlists = []
                  } catch (error) {
                    reject(error)
                  }

                  await Promise.all(library.map(async (playlist: iPlaylist) => {
                    try {
                      await this.create(playlist)
                    } catch (error) {

                      reject(error)
                    }
                  }))

                  try {
                    cacheImageService.setForceUpdate()
                    await this.refreshCache()
                  } catch (error) {
                    reject(error)
                  }
                  resolve()
                }
              } catch (error) {
                reject(`importLibrary error ${error}`)
              }
            }
            fileReader.onerror = (error) => {
              reject(`importLibrary fileReader error ${error}`)
            }
            const { files } = <HTMLInputElement>e?.target
            if (files?.length || 0 > 0) {
              fileReader.readAsText(files[0])
            }
          } else {
            reject('Unable to load library')
          }
        }

        input.click()
      })

    },
    async deleteAllPlaylists(skeepConfirmation = false) {
      if (skeepConfirmation || confirm('Vous allez supprimer toutes les playlists. On y va ?')) {
        try {
          await playlistService?.deleteDatabase()
          localStorage.removeItem('lastPlaylists')
          this.playlists = null
          this.lastPlaylists = null
        } catch (error) {
          console.error('Can\'t delete library', error)
        }
      }
    }
  },
})
