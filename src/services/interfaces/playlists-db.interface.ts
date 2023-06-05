import { DBSchema } from 'idb'
import { iPlaylist } from '../interfaces/playlist.interface'
import { iCache } from '../interfaces/cache.interface'

export const PLAYLIST_STORE_NAME = 'playlistsStore'
export const CACHE_STORE_NAME = 'cacheStore'

export interface iBloomBoxDB extends DBSchema {
  playlistsStore: iPlaylist,
  cacheStore: iCache
}
