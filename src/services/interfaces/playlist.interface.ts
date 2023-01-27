import { iFile } from './file.interface'

export interface iPlaylist {
  uuid: string,
  label: string,
  img: string,
  children?: iFile[] | iPlaylist[]
}
