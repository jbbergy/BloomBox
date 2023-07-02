import { DBSchema } from 'idb'
import { iPlaylist } from '../interfaces/playlist.interface'
import { iCache } from '../interfaces/cache.interface'

export const PLAYLIST_STORE_NAME = 'playlistsStore'
export const CACHE_STORE_NAME = 'cacheStore'

export interface iBloomBoxDB extends DBSchema {
  [PLAYLIST_STORE_NAME]: {
    value: iPlaylist
    key: string
  }
}
export interface iBloomBoxDBCache extends DBSchema {
  [CACHE_STORE_NAME]: {
    value: iCache
    key: string
    indexes: {
      'identifier': string
    }
  }
}
