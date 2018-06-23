import { app, BrowserWindow } from 'electron';
import { client } from 'electron-connect';

import { isProduction } from './constants';
import { startUpdater } from './updater';

const useElectronConnect = process.env.ELECTRON_CONNECT === 'true';

let mainWindow: BrowserWindow;

const isSecondInstance = app.makeSingleInstance(() => {
    if (!mainWindow) {
        return;
    }

    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }

    mainWindow.focus();
});

if (isSecondInstance) {
    app.quit();
}

function onAppReady() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        frame: true,
        title: 'Stash Police',
        minHeight: 700,
        minWidth: 900
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    startUpdater(mainWindow);

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
