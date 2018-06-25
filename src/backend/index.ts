import { app, BrowserWindow } from 'electron';
import { client } from 'electron-connect';
import * as electronUnhandled from 'electron-unhandled';

import { logger } from '../common';
import { windowStateKeeper } from './utils';
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

electronUnhandled({
    logger: logger.error
});

function onAppReady() {
    const mainWindowState = windowStateKeeper();

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        center: true,
        frame: true,
        show: false,
        transparent: false,
        title: 'Stash Police',
        minHeight: 700,
        minWidth: 900,
        backgroundColor: '#0f0f0f'
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    startUpdater(mainWindow);
    mainWindowState.track(mainWindow);

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
