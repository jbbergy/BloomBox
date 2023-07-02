import { defineStore } from 'pinia'
import { CacheImageService } from 'src/services/cache/images.cache.service'
import { iCache } from 'src/services/interfaces/cache.interface'

const cacheImageService = new CacheImageService()

export const useCacheStore = defineStore('cacheStore', {
  actions: {
    async add(item: iCache) {
      try {
        await cacheImageService.addToCache(item)
      } catch (error) {
        console.error("Cache store add error", error)
      }
    },
    async get(key: string): Promise<string | null> {
      try {
        return await cacheImageService.getFromCache(key)
      } catch (error) {
        console.error("Cache store get error", error)
      }
      return null
    },
    setLastUpdate() {
      try {
        cacheImageService.setLastUpdate()
      } catch (error) {
        console.error("Cache store setLastUpdate error", error)
      }
    },
    setForceUpdate() {
      try {
        cacheImageService.setForceUpdate()
      } catch (error) {
        console.error("Cache store setForceUpdate error", error)
      }
    }
  },
  getters: {
    getLastUpdate: () => cacheImageService.getLastUpdate()
  }
})
