import { openDB, deleteDB } from 'idb'
import { PLAYLIST_STORE_NAME, iBloomBoxDB } from '../interfaces/playlists-db.interface'

const DATABASE_NAME = 'BBdb'

export class usePlaylistsService {
  private dbPromise: Promise<IDBDatabase<iBloomBoxDB>>

  constructor() {
    this.dbPromise = openDB<iBloomBoxDB>(DATABASE_NAME, 1)
  }

  async create(data: unknown) {
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
    return store.get(key)
  }

  async readAll() {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readonly')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    return store.getAll()
  }

  async update(key: number, data: unknown) {
    const db = await this.dbPromise
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readwrite')
    const store = tx.objectStore(PLAYLIST_STORE_NAME)
    store.put({ key, value: data })
    return tx.complete
  }

  async delete(key: string) {
    console.log('delete key', key)
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

  async deleteDatabase() {
    await deleteDB(DATABASE_NAME)
  }

  async findByUUID(uuid: string) {
    const db = await this.dbPromise;
    const tx = db.transaction(PLAYLIST_STORE_NAME, 'readonly');
    const store = tx.objectStore(PLAYLIST_STORE_NAME);
    const items = await store.getAll();
    return items.find(item => item.uuid === uuid);
  }
}
