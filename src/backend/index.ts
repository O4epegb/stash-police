import { app, BrowserWindow } from 'electron';
import { client } from 'electron-connect';

const isProduction = process.env.NODE_ENV === 'production';
const useElectronConnect = process.env.ELECTRON_CONNECT === 'true';

function onAppReady() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        frame: true,
        title: 'Stash Police',
        minHeight: 700,
        minWidth: 900
        // webPreferences: {
        //     webSecurity: false
        // }
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    if (!isProduction) {
        mainWindow.webContents.openDevTools();
    }

    if (useElectronConnect) {
        client.create(mainWindow);
    }
}

app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', onAppReady);
