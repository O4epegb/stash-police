import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import { app, remote } from 'electron';
import { transports, format, createLogger } from 'winston';
import { isProduction } from './backend/constants';
// tslint:disable-next-line
require('winston-daily-rotate-file');

const App = app || remote.app;

export enum IpcAction {
    Update = 'Update'
}

export type IpcUpdateAction = 'check' | 'download' | 'install';

export type IpcUpdateStatus =
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'ready-to-install'
    | 'error';

export enum FileNames {
    Settings = 'stash-police-settings.json',
    Reports = 'stash-police-reports.json'
}

export const userDataPath = App.getPath('userData');
export const logsPath = App.getPath('logs');
export const settingsPath = path.join(userDataPath, FileNames.Settings);
export const reportsPath = path.join(userDataPath, FileNames.Reports);

export interface Settings {
    version: string;
    sessionId?: string;
    userInfo: UserInfo;
    windowState: WindowState;
}

export interface WindowState {
    x: DefaultWindowSize;
    y: DefaultWindowSize;
    width: number;
    height: number;
    isMaximized: boolean;
}

export interface UserInfo {
    accountName: string;
    avatarUrl: string;
}

export enum DefaultWindowSize {
    width = 1280,
    height = 720
}

const defaultSettings: Settings = {
    version: App.getVersion(),
    userInfo: {
        accountName: '',
        avatarUrl: ''
    },
    windowState: {
        x: 0,
        y: 0,
        width: DefaultWindowSize.width,
        height: DefaultWindowSize.height,
        isMaximized: false
    }
};

export function getSettings(): Settings {
    if (!fs.pathExistsSync(settingsPath)) {
        fs.writeJsonSync(settingsPath, defaultSettings);
    }

    return _.merge(defaultSettings, fs.readJsonSync(settingsPath));
}

export function updateSettings(newSettings: Partial<Settings>): Settings {
    const currentSettings = getSettings();
    const nextSettings = Object.assign({}, currentSettings, newSettings);

    fs.writeJsonSync(settingsPath, nextSettings);

    return nextSettings;
}

const rfsTransport = new (transports as any).DailyRotateFile({
    filename: 'stash-police-%DATE%.log',
    dirname: logsPath,
    datePattern: 'DD-MM-YYYY',
    maxSize: '20m',
    maxFiles: '14d'
});

export const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        rfsTransport,
        !isProduction && new transports.Console()
    ].filter(Boolean)
});
