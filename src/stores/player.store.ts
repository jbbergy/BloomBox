import { defineStore } from 'pinia';
import { AudioService } from '../services/audio/audio.service'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentInstance: null as AudioService | null,
    defaultVolume: 0.8,
  }),
  actions: {
    pause() {
      if (!this.currentInstance) return
      if (this.currentInstance.getIsPlaying()) {
        this.currentInstance.pause()
      } else {
        this.currentInstance.play()
      }
    },
    play(filePath: string) {
      if (this.currentInstance) {
        this.currentInstance.stop()
        this.currentInstance.destroy()
      }
      this.currentInstance = new AudioService(filePath)
      this.currentInstance.setVolume(this.defaultVolume)
      this.currentInstance.play()
    },
  },/* It's closing the `defineStore` function. */
});
