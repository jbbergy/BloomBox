import { app, BrowserWindow, nativeTheme, ipcMain, Menu, globalShortcut } from 'electron'
import path from 'path'
import os from 'os'
import { readMetadata } from './metadata.service'


const readMetadataHandler = () => {
  ipcMain.handle('metadataApi:readMetadata', async (event, file) => {
    return await readMetadata(file)
  })
}
const transportShortcutsHandler = () => {
  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('media-next-track')
  })
  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('media-previous-track')
  })
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('media-play-pause-track')
  })
}
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) { }

let mainWindow: BrowserWindow | undefined


function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1200,
    height: 768,
    useContentSize: true,
    webPreferences: {
      backgroundThrottling: false,
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })
  Menu.setApplicationMenu(null)
  mainWindow.autoHideMenuBar = true
  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }
  transportShortcutsHandler()

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

app.whenReady().then(() => {
  readMetadataHandler()
  transportShortcutsHandler()
  createWindow()
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow()
  }
})
