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
