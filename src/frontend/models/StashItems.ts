import { Omit } from 'react-router';

interface Layout {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Category {
    currency: any[];
}

interface Colour {
    r: number;
    g: number;
    b: number;
}

export interface StashItem {
    verified: boolean;
    w: number;
    h: number;
    ilvl: number;
    icon: string;
    league: string;
    id: string;
    name: string;
    typeLine: string;
    identified: boolean;
    properties: Properties[];
    explicitMods?: string[];
    descrText?: string;
    frameType: number;
    stackSize: number;
    maxStackSize: number;
    category: Category;
    x: number;
    y: number;
    inventoryId: string;
}

interface Properties {
    name: string;
    values: Values[];
    displayMode: number;
}

export interface StashItemsData extends Omit<StashItemsDataApi, 'tabs'> {
    tabs: Tab[];
}

export interface StashItemsDataApi {
    numTabs: number;
    tabs: TabApi[];
    items: StashItem[];
    currencyLayout: Record<string, Layout>;
}

export interface TabApi {
    n: string;
    i: number;
    id: string;
    type: string;
    hidden: boolean;
    selected: boolean;
    colour: Colour;
    srcL: string;
    srcC: string;
    srcR: string;
}

export interface Tab
    extends Omit<
            TabApi,
            'srcC' | 'srcR' | 'srcL' | 'hidden' | 'colour' | 'selected'
        > {
    color: string;
    textColor: string;
}

export type Tabs = Array<Tab>;

interface Values {
    0: string;
    1: number;
}
