import * as path from 'path';
import { app, BrowserWindow } from 'electron';
import { client } from 'electron-connect';
import { autoUpdater } from 'electron-updater';

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
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    if (!isProduction) {
        mainWindow.webContents.openDevTools();

        autoUpdater.updateConfigPath = path.join(
            __dirname,
            'dev-app-update.yml'
        );
    }

    if (useElectronConnect) {
        client.create(mainWindow);
    }

    autoUpdater.on('error', error => {
        console.log('update-error', error);
    });

    autoUpdater.on('update-available', () => {
        console.log('update-available');
    });

    autoUpdater.on('update-not-available', () => {
        console.log('update-not-available');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('update-downloaded');
    });

    autoUpdater.checkForUpdates();
}

app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', onAppReady);
