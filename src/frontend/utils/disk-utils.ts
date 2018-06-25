import * as fs from 'fs-extra';

import { reportsPath } from '../../common';
import { Reports, ReportsFile } from '../models';

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
