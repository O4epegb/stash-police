export interface Settings {
    version: string;
    sessionId?: string;
    userInfo: UserInfo;
}

export interface UserInfo {
    accountName: string;
    avatarUrl: string;
}
