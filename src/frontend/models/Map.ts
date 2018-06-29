import {
    Sparkline,
    ExplicitModifiersItem,
    NinjaOverviewItemTypes
} from './common';

export interface MapOverviewApi {
    lines: MapItemApi[];
}

export interface UniqueMapOverviewApi {
    lines: MapItemApi[];
}

export interface MapItemApi {
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
    lowConfidenceSparkline: Sparkline;
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

export interface MapItem extends MapItemApi {
    type: NinjaOverviewItemTypes.Map;
}

export interface UniqueMapItem extends MapItemApi {
    type: NinjaOverviewItemTypes.UniqueMap;
}
