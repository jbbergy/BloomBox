import { iFile } from './file.interface'

export interface iPlaylist {
  order: number
  key: number
  uuid: string
  label: string
  img?: string
  files?: iFile[] | string
  children?: iPlaylist[]
}
