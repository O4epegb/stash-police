import {
    Sparkline,
    ExplicitModifiersItem,
    ImplicitModifiersItem
} from './common';

export interface FlaskOverview {
    lines: FlaskItem[];
}
export interface FlaskItem {
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
