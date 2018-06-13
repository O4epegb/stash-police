import { observable, action, computed } from 'mobx';

import { Time, isDevelopment } from './constants';
import { getReportsFromDisk, updateReportsOnDisk } from './utils';
import { Reports, Report, UserInfo } from './models';

class StoreClass {
    constructor() {
        setInterval(this.toogleUpdateFlag, Time.Minute);
    }

    @observable
    userInfo: UserInfo = {
        accountName: '',
        avatarUrl: ''
    };
    @observable reports: Reports = [];
    @observable activeReport: Report | null = null;
    @observable layourLoaderText = '';
    @observable updateFlag = false;

    @computed
    get accountName(): string {
        return this.userInfo.accountName;
    }

    @computed
    get avatarUrl(): string {
        return this.userInfo.avatarUrl;
    }

    @action
    toogleUpdateFlag = () => {
        this.updateFlag = !this.updateFlag;
    };

    @action
    setReports = (reports: Reports) => {
        this.reports = reports;
    };

    @action
    addReport = (report: Report) => {
        this.reports.push(report);

        updateReportsOnDisk(this.accountName, this.reports);
    };

    @action
    updateReport = (updatedReport: Report) => {
        this.reports = this.reports.map(
            report => (report.id === updatedReport.id ? updatedReport : report)
        );

        updateReportsOnDisk(this.accountName, this.reports);
    };

    @action
    deleteReport = (reportToDelete: Report) => {
        this.reports = this.reports.filter(r => r.id !== reportToDelete.id);

        updateReportsOnDisk(this.accountName, this.reports);
    };

    @action
    setUserInfo = (userInfo: UserInfo) => {
        this.userInfo = userInfo;

        this.setReports(getReportsFromDisk(this.accountName));
    };

    @action
    setActiveReport = (reportId: string) => {
        this.activeReport = this.reports.find(report => report.id === reportId);
    };

    @action
    setLayoutLoaderText = (text?: string) => {
        this.layourLoaderText = text || '';
    };
}

export const Store = new StoreClass();

if (isDevelopment) {
    (window as any).Store = Store;
}
