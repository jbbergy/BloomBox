import { defineStore } from 'pinia';
import { iFile } from 'src/services/interfaces/file.interface';
import { readMetadata } from '../services/metadata/metadata.service'
import { Buffer } from 'buffer'

const getRandomValue = (lower, upper) => {
  const crypto = window.crypto
  const range = upper - lower + 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return lower + (array[0] % range);
}

export const usePlayQueueStore = defineStore('playQueue', {
  state: () => ({
    queue: [] as iFile[],
    selectedFile: null as iFile | null,
    playingFile: null as iFile | null,
    currentCover: null as string | null,
    loop: false,
    shuffle: false
  }),
  actions: {
    async getCurrentCover() {
      if (!this.playingFile?.path) return null
      let metadata = null
      try {
        metadata = await readMetadata(this.playingFile?.path)
      } catch (error) {
        console.error(error)
      }
      if (metadata?.tags?.picture) {
        const image = Buffer.from(metadata.tags?.picture?.data).toString('base64')
        this.currentCover = `data:${metadata.tags?.picture?.format};base64,${image}`
      }
    },
    addToQueue(files: iFile[]) {
      this.queue = []
      files?.forEach(file => {
        this.queue.push(file)
      })
    },
    removeFromQueue(fileId: string) {
      this.queue = this.queue.filter(f => f.uuid !== fileId)
    },
    clearQueue() {
      this.queue = []
    },
    nextFile() {
      let idx = this.queue.findIndex(f => f.uuid === this.playingFile?.uuid)
      if (idx === -1) return
      if (this.loop) {
        this.playingFile = null
      } else if (this.shuffle) {
        idx = getRandomValue(0, this.queue.length - 1)
      } else {
        idx = idx + 1 === this.queue.length ? 0 : ++idx
      }
      this.playingFile = this.queue[idx]
    },
    prevFile() {
      let idx = this.queue.findIndex(f => f.uuid === this.playingFile?.uuid)
      if (idx === -1) return
      if (this.loop) {
        this.playingFile = null
      } else if (this.shuffle) {
        idx = getRandomValue(0, this.queue.length - 1)
      } else {
        idx = idx === 0 ? this.queue.length : idx - 1
      }
      this.playingFile = this.queue[idx]
    }
  },
})
