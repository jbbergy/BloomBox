import { defineStore } from 'pinia'
import { AudioService } from '../services/audio/audio.service'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentInstance: null as AudioService | null,
    defaultVolume: 0.5,
  }),
  actions: {
    pause() {
      if (!this.currentInstance) return
      this.currentInstance.pause()
    },
    play(filePath: string, callback: unknown) {
      if (this.currentInstance) {
        this.currentInstance.stop()
        this.currentInstance.destroy()
      }
      this.currentInstance = new AudioService(filePath)
      this.currentInstance.setVolume(this.defaultVolume)
      this.currentInstance.play()
      if (callback) {
        this.currentInstance.getInstance().on('end', () => {
          callback()
        })
      }
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'player-store',
        paths: [
          'defaultVolume'
        ]
      }
    ],
  },
})
