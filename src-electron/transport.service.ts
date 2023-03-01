const { ipcRenderer } = require('electron');

export async function onNextTrack() {
  ipcRenderer.send('on-key-press', { data: 'MediaNextTrack' })
}
