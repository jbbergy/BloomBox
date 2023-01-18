import { DBSchema } from 'idb';
import { iPlaylist } from '../interfaces/playlist.interface'

export const PLAYLIST_STORE_NAME = 'playlistsStore'

export interface iBloomBoxDB extends DBSchema {
  playlistsStore: iPlaylist
}
