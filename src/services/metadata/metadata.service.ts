import { iMetadata } from '../interfaces/file.interface';

export function readMetadata(filePath: string): Promise<iMetadata> {
  try {
    const result = window['metadataApi']?.readMetadata(filePath)
    return result
  } catch (error) {
    throw new Error(`service readMetadata error ${error}`);
  }
}
