import { defineStore } from 'pinia';
import { AudioService } from '../services/audio/audio.service'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentInstance: null,
    defaultVolume: 0.8,
  }),
  actions: {
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
