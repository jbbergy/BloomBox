import { defineStore } from 'pinia'
import { iFile } from 'src/services/interfaces/file.interface'
import { CacheImageService } from '../services/cache/images.cache.service'
import CoverImage from '../assets/img/cover.jpg'
import { getRandomValue } from '../utils/random'
import { iCache } from 'src/services/interfaces/cache.interface'

export const usePlayQueueStore = defineStore('playQueue', {
  state: () => ({
    queue: [] as iFile[],
    selectedFile: null as iFile | null,
    playingFile: null as iFile | null,
    currentCover: null as string | null,
    loop: false,
    shuffle: false
  }),
  actions: {
    async getCurrentCover() {
      this.currentCover = CoverImage
      if (!this.playingFile || !this.playingFile.album) return null
      const cacheImageService = new CacheImageService()
      cacheImageService.init()
      const cacheResponse: iCache | null = await cacheImageService.getFromCache(this.playingFile.album)
      this.currentCover = cacheResponse?.data
    },
    addToQueue(files: iFile[]) {
      this.queue = []
      files?.forEach(file => {
        this.queue.push(file)
      })
    },
    removeFromQueue(fileId: string) {
      this.queue = this.queue.filter(f => f.uuid !== fileId)
    },
    clearQueue() {
      this.queue = []
    },
    nextFile() {
      let idx = this.queue.findIndex(f => f.uuid === this.playingFile?.uuid)
      if (idx === -1) return
      if (this.loop) {
        this.playingFile = null
      } else if (this.shuffle) {
        idx = getRandomValue(0, this.queue.length - 1)
      } else {
        idx = idx + 1 === this.queue.length ? 0 : ++idx
      }
      this.playingFile = this.queue[idx]
    },
    prevFile() {
      let idx = this.queue.findIndex(f => f.uuid === this.playingFile?.uuid)
      if (idx === -1) return
      if (this.loop) {
        this.playingFile = null
      } else if (this.shuffle) {
        idx = getRandomValue(0, this.queue.length - 1)
      } else {
        idx = idx === 0 ? this.queue.length : idx - 1
      }
      this.playingFile = this.queue[idx]
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'play-queue-store',
        paths: [
          'shuffle',
          'loop'
        ]
      }
    ],
  },
})
