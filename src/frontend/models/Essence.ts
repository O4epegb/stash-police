import { Sparkline, ExplicitModifiersItem } from './common';

export interface EssenceOverview {
    lines: EssenceItem[];
}

export interface EssenceItem {
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
