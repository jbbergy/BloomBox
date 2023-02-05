import { defineStore } from 'pinia';
import { iFile } from 'src/services/interfaces/file.interface';

export const usePlayQueueStore = defineStore('playQueue', {
  state: () => ({
    queue: [] as iFile[],
    selectedFile: null as iFile | null,
    playingFile: null as iFile | null,
  }),
  actions: {
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
      idx = idx + 1 === this.queue.length ? 0 : ++idx
      this.playingFile = this.queue[idx]
    },
    prevFile() {
      let idx = this.queue.findIndex(f => f.uuid === this.playingFile?.uuid)
      if (idx === -1) return
      if (idx === 0) idx = this.queue.length
      this.playingFile = this.queue[idx - 1]
    }
  },
})
