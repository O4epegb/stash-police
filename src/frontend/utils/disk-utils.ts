import * as fs from 'fs-extra';
import * as url from 'url';
import { remote } from 'electron';

import {
    settingsPath,
    reportsPath,
    ApiUrls,
    poeCookieName
} from '../constants';
import { Reports, Settings, ReportsFile } from '../models';

export function setSessionIdCookie(sessionId: string) {
    return new Promise((resolve, reject) => {
        const cookie = {
            url: ApiUrls.index,
            name: poeCookieName,
            value: sessionId,
            domain: url.parse(ApiUrls.index).host
        };

        if (remote.session.defaultSession) {
            remote.session.defaultSession.cookies.set(cookie, error => {
                if (error) {
                    console.error(error);
                    return reject();
                }

                updateSettings({ sessionId });

                return resolve();
            });
        } else {
            return reject();
        }
    });
}

export function removeSessionIdCookie() {
    return new Promise((resolve, reject) => {
        if (remote.session.defaultSession) {
            remote.session.defaultSession.cookies.remove(
                ApiUrls.index,
                poeCookieName,
                (error: any) => {
                    if (error) {
                        console.error(error);
                        return reject();
                    }

                    updateSettings({ sessionId: '' });

                    return resolve();
                }
            );
        } else {
            return reject();
        }
    });
}

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

export function getReportsFromDisk(accountName: string): Reports | null {
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
