import { League } from './League';
import { StashItem, Tabs } from './StashItems';

export interface ReportsFile {
    version: string;
    reportsByUser: Record<string, Reports>;
}

export type Reports = Array<Report>;
export interface Report {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    league: League;
    checkouts: Checkouts;
    lastProccessedTabs: Tabs;
}

export type Checkouts = Array<Checkout>;

export interface Checkout {
    id: string;
    createdAt: string;
    items: CheckoutItems;
    tabs: Tabs;
}

export type CheckoutItems = Record<string, CheckoutItem>;
export interface CheckoutItem {
    stackSize: number;
    cost: number;
    name: string;
    originalItem: StashItem;
}
