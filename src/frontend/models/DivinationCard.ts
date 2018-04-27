import { Sparkline, ExplicitModifiersItem } from './common';

export interface DivinationCardOverview {
    lines: DivinationCardItem[];
}

export interface DivinationCardItem {
    id: number;
    name: string;
    icon: string;
    mapTier: number;
    levelRequired: number;
    baseType: null;
    stackSize: number;
    variant: null;
    prophecyText: null;
    artFilename: string;
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
