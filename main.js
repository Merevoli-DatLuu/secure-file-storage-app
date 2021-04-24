const electron = require('electron')
const app = electron.app
const { dialog } = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.loadURL(`file://${__dirname}/file-manager/app-file-manager.html`)
    console.log(`file://${__dirname}/file-manager/app-file-manager.html`)
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.handle( 'app:on-folder-dialog-open', ( event ) => {
    return dialog.showOpenDialogSync(mainWindow, { properties: ['openDirectory'] })
} );