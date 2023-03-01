import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
  'metadataApi',
  {
    readMetadata: async (file: string) => await ipcRenderer.invoke('metadataApi:readMetadata', file),
  }
)

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, callback: CallableFunction) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
});
