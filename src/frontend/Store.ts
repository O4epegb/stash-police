import { observable, action, computed } from 'mobx';
import { ipcRenderer } from 'electron';

import { Time, isDevelopment } from './constants';
import { getReportsFromDisk, updateReportsOnDisk } from './utils';
import { Reports, Report, UserInfo, Leagues } from './models';
import { getLeagues } from './services';
import { IpcAction, IpcUpdateStatus, IpcUpdateAction } from '../common';

function sendUpdateMessage(ipcAction: IpcUpdateAction) {
    ipcRenderer.send(IpcAction.Update, ipcAction);
}

class StoreClass {
    constructor() {
        setInterval(this.toogleUpdateFlag, Time.Minute);
        setInterval(this.updateLeagues, Time.Minute * 5);
        this.updateLeagues();

        sendUpdateMessage('check');

        ipcRenderer.on(
            IpcAction.Update,
            action((event, status: IpcUpdateStatus) => {
                this.updateStatus = status;
                if (status === 'available') {
                    this.updateText = 'Update available';
                    this.updateButtonText = 'Download';
                } else if (status === 'downloading') {
                    this.updateText = 'Downloading update';
                    this.updateButtonText = '';
                } else if (status === 'ready-to-install') {
                    this.updateText = 'Update downloaded';
                    this.updateButtonText = 'Install';
                } else if (status === 'error') {
                    this.updateText = 'Update error';
                    this.updateButtonText = 'Ok';
                } else {
                    this.updateText = '';
                    this.updateButtonText = '';
                }
            })
        );
    }

    @observable updateText = '';
    @observable updateButtonText = '';
    @observable updateStatus: IpcUpdateStatus = 'checking';

    @observable
    userInfo: UserInfo = {
        accountName: '',
        avatarUrl: ''
    };
    @observable leagues: Leagues = [];
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
    onUpdateButtonClick = () => {
        if (this.updateStatus === 'available') {
            sendUpdateMessage('download');
        } else if (this.updateStatus === 'ready-to-install') {
            sendUpdateMessage('install');
        } else if (this.updateStatus === 'error') {
            this.updateText = '';
            this.updateButtonText = '';
        }
    };

    updateLeagues = () => {
        return getLeagues().then(this.setLeagues);
    };

    @action
    setLeagues = (leagues: Leagues) => {
        this.leagues = leagues;
    };

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
