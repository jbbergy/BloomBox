import { iMetadata } from 'src/services/interfaces/file.interface'
import { Buffer } from 'buffer'
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { iPlaylist } from 'src/services/interfaces/playlist.interface'
import { iFile } from 'src/services/interfaces/file.interface'
import { PlaylistsService } from 'src/services/playlists/playlists.service'
import { readMetadata } from 'src/services/metadata/metadata.service'
import { useCacheStore } from './cache.store'
import ImgCover from 'src/assets/img/cover.jpg'
import ImgFavCover from 'src/assets/img/fav-cover.png'
import { useGlobalStore } from './global.store'

let playlistService: PlaylistsService
const FAV_LABEL = 'Titres likés'
const cacheStore = useCacheStore()
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
    playlists: [] as iPlaylist[],
    lastPlaylists: [] as iPlaylist[] | null,
    filter: null as string | null,
    impageCache: {},
    selectedPlaylist: null as iPlaylist | null,
    currentPlaylist: null as iPlaylist | null,
    needCacheUpdate: false,
    refreshCovers: false,
    refreshPlaylistsToken: uuid(),
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

  },
  actions: {
    getPlaylistCover: async (playlist: iPlaylist) => {
      if (playlist.label === FAV_LABEL) return playlist.img

      const labelCover = await cacheStore.get(playlist.label)

      let albumCover = null
      if (
        !labelCover
        && playlist?.files?.length
      ) {
        const firstfile = playlist.files[0] as iFile

        if (firstfile?.artist && firstfile?.album) {
          albumCover = await cacheStore.get(firstfile.album)
        }
      }
      const cover = labelCover || albumCover
      const img = cover || ImgCover

      return img
    },
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
      playlistService = new PlaylistsService()
      this.needCacheUpdate = false

      const lastUpdateDate = cacheStore.getLastUpdate
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
        await this.create(favPlaylist)
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
      globalStore.loadingMessage = 'Chargement...mise à jour du cache'
      globalStore.loadingTarget = 'global'

      const files: iFile[] = this.playlists.flatMap((playlist: iPlaylist) => {
        return playlist.files as iFile[]
      })

      if (files?.length) {
        const filesUnique = files
          .filter((file: iFile, index: number, array: iFile[]) => {
            const isDuplicate = array.findIndex((f: iFile) => {
              return file?.album && f?.album === file?.album
            }) !== index

            return !isDuplicate
          })

        if (filesUnique?.length) {
          await Promise.all(filesUnique.map(async (file) => {
            if (!file.album) return
            const cachedFile = await cacheStore.get(file.album)
            if (!cachedFile) {
              const img = await getCoverBase64(file.path)
              if (img) {
                await cacheStore.add({
                  identifier: file.album,
                  data: img
                })
              }
            }
          }))

          await this.loadPlaylistsImg()
        }
      }

      cacheStore.setLastUpdate()
      this.needCacheUpdate = false
      globalStore.isLoading = false
      globalStore.loadingTarget = null
      globalStore.loadingMessage = null
    },
    async loadPlaylistsImg() {
      if (this.playlists?.length) {
        this.playlists.forEach(async (playlist) => {
          playlist.img = await this.getPlaylistCover(playlist) as string
        })
        this.refreshPlaylistsToken = uuid()
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
        console.error('ERROR playlist service create #2.1 : ', error)
      }

      if (!newPlaylist) return
      else this.playlists.push(newPlaylist)

      try {
        const idx = this.playlists.findIndex(p => p.uuid === newPlaylist?.uuid)
        this.playlists[idx] = newPlaylist
      } catch (error) {
        console.error('ERROR playlist service create #2.2 : ', error)
      }
      cacheStore.setForceUpdate()
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
    async deleteFile(filetoDelete: iFile) {
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
        cacheStore.setForceUpdate()
        await this.refreshCache()
      }
    },
    async formatFile(fileToFormat: iFile) {
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
      globalStore.isLoading = true
      globalStore.loadingMessage = 'Chargement...mise à jour du cache'
      globalStore.loadingTarget = 'global'

      this.refreshCovers = false
      if (files?.length <= 0) return
      const formattedFiles = Array.from(files)

      const newPlaylist: iPlaylist = playlist || { ...this.selectedPlaylist }
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
      cacheStore.setForceUpdate()
      await this.refreshCache()
      this.refreshCovers = true

      globalStore.isLoading = false
      globalStore.loadingTarget = null
      globalStore.loadingMessage = null
    },
    async updateCover(coverFile: any) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        let base64 = null
        reader.onload = async (fileLoadedEvent) => {
          base64 = fileLoadedEvent?.target?.result
          await cacheStore.add({
            identifier: this.selectedPlaylist?.label as string,
            data: base64 as string
          })
          cacheStore.setForceUpdate()
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
                if (library?.length && library.length > 0) {
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
                    cacheStore.setForceUpdate()
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
    },
    async findByUUID(uuid: string) {
      if (!uuid) return null
      try {
        return await playlistService.findByUUID(uuid)
      } catch (error) {
        throw error
      }
    },
    async update(key: number, data: iPlaylist) {
      if (!key || !data) return null
      try {
        return await playlistService.update(key, data)
      } catch (error) {
        throw error
      } finally {
        this.refreshPlaylistsToken = uuid()
      }
    }
  },
})
