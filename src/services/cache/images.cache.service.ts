import { openDB } from 'idb'
import dayjs from 'dayjs'
import { CACHE_STORE_NAME, iBloomBoxDBCache } from 'src/services/interfaces/playlists-db.interface'
import { iCache } from 'src/services/interfaces/cache.interface'
import { Console } from 'console'

const INDEX_NAME = "identifierIndex"
const DATABASE_NAME = 'BBdbCache'
const IMAGE_CACHE_LAST_UPDATE = 'image-cache-last-update'
export class CacheImageService {
  private dbPromise: Promise<IDBDatabase<iBloomBoxDBCache>>

  constructor() {
    this.dbPromise = openDB<iBloomBoxDBCache>(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          const store = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id', autoIncrement: true })
          store.createIndex(INDEX_NAME as never, 'identifier')
        }
      }
    })
  }

  async addToCache(cacheObject: iCache): Promise<void> {
    console.log('cacheObject', cacheObject)
    let isInCache = null
    try {
      isInCache = await this.getFromCache(cacheObject.identifier)
      console.log('isInCache', isInCache)
    } catch (error) {
      throw error
    }

    if (isInCache) {
      return
    }
    const db = await this.dbPromise
    const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
    const store = tx.objectStore(CACHE_STORE_NAME)
    await store.add(cacheObject)
    await tx.complete
  }

  async update(key: number, data: string) {
    try {
      const db = await this.dbPromise
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
      const store = tx.objectStore(CACHE_STORE_NAME)
      store.put(data)
      return tx.complete
    } catch (error) {
      throw error
    }
  }

  async deleteFromCache(key: string | number) {
    const db = await this.dbPromise
    const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
    const store = tx.objectStore(CACHE_STORE_NAME)
    store.delete(key)
    return tx.complete
  }

  async getFromCache(key: string): Promise<string | null> {
    if (key && key !== 'inconnu') {
      const db = await this.dbPromise
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly')
      const store = tx.objectStore(CACHE_STORE_NAME)
      const index = store.index(INDEX_NAME)
      const result = await index.getAll(IDBKeyRange.only(key))
      return result.length > 0 ? result[0].data : null
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
