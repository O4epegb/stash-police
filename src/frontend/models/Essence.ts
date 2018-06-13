import {
    Sparkline,
    ExplicitModifiersItem,
    NinjaOverviewItemTypes
} from './common';

export interface EssenceOverviewApi {
    lines: EssenceItemApi[];
}

export interface EssenceItemApi {
    id: number;
    name: string;
    icon: string;
    mapTier: number;
    levelRequired: number;
    baseType: string;
    stackSize: number;
    variant: string | null;
    prophecyText: null;
    artFilename: null;
    links: number;
    itemClass: number;
    sparkline: Sparkline;
    implicitModifiers: any[];
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

export interface EssenceItem extends EssenceItemApi {
    type: NinjaOverviewItemTypes.Essence;
}
