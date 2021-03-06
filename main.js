const electron = require('electron')
const app = electron.app
const { dialog } = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain
let mainWindow
require('v8-compile-cache');
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

function createWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    mainWindow.loadURL(`file://${__dirname}/file-manager/login.html`)
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