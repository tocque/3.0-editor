// Modules to control application life and create native browser window
// @ts-check
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 640,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        }
    })

    mainWindow.webContents.on("new-window", (event, url) => {
        shell.openExternal(url);
        event.preventDefault();
    })

    mainWindow.loadFile('index.html')

    ipcMain.on('window-minimize', () => {
        mainWindow.minimize();
    })
    
    ipcMain.on('window-maximize', (event) => {
        const maxed = mainWindow.isMaximized();
        if (maxed) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
        event.sender.send('window-maximized', !maxed)
    })
    
    ipcMain.on('window-close', () => {
        mainWindow.close();
    })
    
    ipcMain.on('open-devtool', () => {
        mainWindow.webContents.openDevTools();
    })
    mainWindow.webContents.openDevTools();

    ipcMain.on('open-directory-dialog', (event, p) => {
        dialog.showOpenDialog({
            properties: [p]
        }).then(({ canceled, filePaths }) => {
            if (!canceled) {
                event.sender.send('selectedItem', filePaths[0]);
            }
        });
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
