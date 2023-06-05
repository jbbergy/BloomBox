import { openDB } from 'idb'
import dayjs from 'dayjs'
import { CACHE_STORE_NAME, iBloomBoxDB } from '../interfaces/playlists-db.interface'
import { iCache } from '../interfaces/cache.interface'

const DATABASE_NAME = 'BBdb'
const IMAGE_CACHE_LAST_UPDATE = 'image-cache-last-update'
export class CacheImageService {
  private isInit = false
  private dbPromise: Promise<IDBDatabase<iBloomBoxDB>>

  async init() {
    if (this.isInit) return
    this.dbPromise = await openDB<iBloomBoxDB>(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          const store = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id', autoIncrement: true })
          store.createIndex('keyIndex', 'key')
        }
      }
    })
    this.isInit = true
  }

  getIsInit() {
    return this.isInit
  }

  async addToCache(cacheObject: iCache) {
    let db = null
    try {
      db = await this.dbPromise
    } catch (error) {
      throw error
    }

    if (db) {
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
      const store = tx.objectStore(CACHE_STORE_NAME)
      store.add(cacheObject)
      return tx.complete
    }
  }

  async getFromCache(key: string): Promise<iCache | null> {
    if (key && key !== 'inconnu') {
      let db = null
      try {
        db = await this.dbPromise
      } catch (error) {
        throw error
      }

      if (db) {
        const tx = db.transaction(CACHE_STORE_NAME, 'readonly')
        const store = tx.objectStore(CACHE_STORE_NAME)
        const index = store.index('keyIndex');
        try {
          return await index.get(key)
        } catch (error) {
          throw error
        }
      }
    }
    return null
  }

  getLastUpdate() {
    const date = localStorage.getItem(IMAGE_CACHE_LAST_UPDATE)
    const lastUpdate = date ? dayjs(date) : null
    return lastUpdate
  }

  setLastUpdate() {
    const date = dayjs().toISOString()
    localStorage.setItem(IMAGE_CACHE_LAST_UPDATE, date)
  }

  setForceUpdate() {
    const date = dayjs().add(-1, 'year').toISOString()
    localStorage.setItem(IMAGE_CACHE_LAST_UPDATE, date)
  }

}
