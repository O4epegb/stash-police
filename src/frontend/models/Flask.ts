import {
    Sparkline,
    ExplicitModifiersItem,
    ImplicitModifiersItem,
    NinjaOverviewItemTypes
} from './common';

export interface UniqueFlaskOverviewApi {
    lines: UniqueFlaskItemApi[];
}

export interface UniqueFlaskItemApi {
    id: number;
    name: string;
    icon: string;
    mapTier: number;
    levelRequired: number;
    baseType: string;
    stackSize: number;
    variant: null | string;
    prophecyText: null;
    artFilename: null;
    links: number;
    itemClass: number;
    sparkline: Sparkline;
    implicitModifiers: ImplicitModifiersItem[];
    explicitModifiers: ExplicitModifiersItem[];
    flavourText: string;
    corrupted: boolean;
    gemLevel: number;
    gemQuality: number;
    itemType: string;
    chaosValue: number;
    exaltedValue: number;
    count: number;
}

export interface UniqueFlaskItem extends UniqueFlaskItemApi {
    type: NinjaOverviewItemTypes.UniqueFlask;
}
