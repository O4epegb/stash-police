import * as fs from 'fs-extra';

import { settingsPath, reportsPath } from '../constants';
import { Reports, Settings, ReportsFile } from '../models';

export function getSettings(): Settings {
    if (!fs.pathExistsSync(settingsPath)) {
        fs.writeJsonSync(settingsPath, {
            version: '1.0',
            userInfo: {}
        } as Settings);
    }

    return fs.readJsonSync(settingsPath);
}

export function updateSettings(newSettings: Partial<Settings>): Settings {
    const currentSettings = getSettings();
    const nextSettings = Object.assign({}, currentSettings, newSettings);

    fs.writeJsonSync(settingsPath, nextSettings);

    return nextSettings;
}

function ensureReportsFileExists() {
    if (!fs.pathExistsSync(reportsPath)) {
        fs.writeJsonSync(reportsPath, {
            version: '1.0',
            reportsByUser: {}
        } as ReportsFile);
    }
}

export function getReportsFromDisk(accountName: string): Reports {
    ensureReportsFileExists();

    return fs.readJsonSync(reportsPath).reportsByUser[accountName] || [];
}

export function updateReportsOnDisk(
    accountName: string,
    newReports: Reports
): Reports {
    ensureReportsFileExists();

    const currentData = fs.readJsonSync(reportsPath);

    const nextData = {
        ...currentData,
        reportsByUser: {
            ...currentData.reportsByUser,
            [accountName]: newReports
        }
    };

    fs.writeJsonSync(reportsPath, nextData);

    return newReports;
}
