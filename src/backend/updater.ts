import * as path from 'path';
import { BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

import { IpcAction, IpcUpdateAction, IpcUpdateStatus } from '../common';
import { isProduction } from './constants';

function sendUpdateMessage(window: BrowserWindow, status: IpcUpdateStatus) {
    window.webContents.send(IpcAction.Update, status);
}

export function startUpdater(window: BrowserWindow) {
    if (!isProduction) {
        autoUpdater.updateConfigPath = path.join(
            __dirname,
            'dev-app-update.yml'
        );
    }

    autoUpdater.on('error', error => {
        console.log('update-error', error);
        sendUpdateMessage(window, 'error');
    });

    autoUpdater.on('update-available', () => {
        console.log('update-available');
        sendUpdateMessage(window, 'available');
    });

    autoUpdater.on('update-not-available', () => {
        console.log('update-not-available');
        sendUpdateMessage(window, 'not-available');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('update-downloaded');
        sendUpdateMessage(window, 'ready-to-install');
    });

    autoUpdater.autoDownload = false;

    ipcMain.on(IpcAction.Update, (event, action: IpcUpdateAction) => {
        if (action === 'check') {
            autoUpdater.checkForUpdates();
        } else if (action === 'download') {
            sendUpdateMessage(window, 'downloading');
            autoUpdater.downloadUpdate();
        } else if (action === 'install') {
            setImmediate(() => autoUpdater.quitAndInstall());
        }
    });
}
