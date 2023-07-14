import { iPlaylist } from 'src/services/interfaces/playlist.interface'
import { openDB } from 'idb'
import { PLAYLIST_STORE_NAME, iBloomBoxDB } from 'src/services/interfaces/playlists-db.interface'

const DATABASE_NAME = 'BBdb'
export class PlaylistsService {
  private dbPromise: Promise<IDBDatabase<iBloomBoxDB>>

  constructor() {
    this.dbPromise = openDB<iBloomBoxDB>(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PLAYLIST_STORE_NAME)) {
          const store = db.createObjectStore(PLAYLIST_STORE_NAME, { keyPath: 'key', autoIncrement: true })
        }
      }
    })
  }

  async create(data: iPlaylist) {
    if (data?.files) {
      data.files = JSON.stringify(data.files)
    }

    try {
      const db = await this.dbPromise
      const tx = db.transaction(PLAYLIST_STORE_NAME, 'readwrite')
      const store = tx.objectStore(PLAYLIST_STORE_NAME)
      store.add(data)
      return tx.complete
    } catch (error) {
      throw error
    }
  }

  async read(key: number) {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readonly')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    const playlist = await store.get(key)
    if (playlist?.files) {
      playlist.files = JSON.parse(playlist.files)
    }

    return playlist
  }

  async readAll() {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readonly')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    const playlists = await store.getAll()

    return playlists?.map(p => {
      if (p.files) {
        p.files = JSON.parse(p.files)
      }
      return p
    })
  }

  async update(key: number, data: iPlaylist) {
    const playlist = { ...data }
    if (playlist?.files && Array.isArray(playlist?.files)) {
      playlist.files = JSON.stringify(playlist.files)
    }

    try {
      const db = await this.dbPromise
      const tx = db.transaction(PLAYLIST_STORE_NAME, 'readwrite')
      const store = tx.objectStore(PLAYLIST_STORE_NAME)
      store.put(playlist)
      return tx.complete
    } catch (error) {
      throw error
    }
  }

  async delete(key: string) {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readwrite')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    store.delete(key)
    return tx.complete
  }

  async clear() {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readwrite')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    store.clear()
    return tx.complete
  }

  async deleteDatabase(): Promise<boolean> {
    const db = await openDB(DATABASE_NAME, 1)

    const transaction = db.transaction(db.objectStoreNames, 'readwrite')

    Array.from(transaction.objectStoreNames).forEach((objectStoreName) => {
      transaction.objectStore(objectStoreName).clear()
    })

    transaction.commit()

    db.close()
    return true
  }

  async findByUUID(uuid: string): Promise<iPlaylist> {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readonly')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    const items = await store.getAll()
    const playlists = items.find(p => p.uuid === uuid)

    if (playlists?.files) {
      playlists.files = JSON.parse(playlists.files)
    }

    return playlists
  }
}
