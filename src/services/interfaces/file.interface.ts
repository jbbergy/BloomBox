export interface iMetadata {
  tags: unknown
  type: string
  version: string
}

export interface iFilePicture {
  data: unknown
  description?: string
  format?: string
  type?: string
}
export interface iFile {
  uuid: string
  label: string
  path: string
  type: string
  size: string
  time?: string
  album?: string
  artist?: string
  genre?: string
}
