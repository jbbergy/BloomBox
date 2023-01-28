import { iFile } from './file.interface'

export interface iPlaylist {
  key: number,
  uuid: string,
  label: string,
  img: string,
  files?: iFile[],
  children?: iPlaylist[]
}
