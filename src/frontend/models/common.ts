export interface Sparkline {
    data: number[] | (null | number)[];
    totalChange: number;
}

export interface ExplicitModifiersItem {
    text: string;
    optional: boolean;
}

export interface ImplicitModifiersItem {
    text: string;
}

export enum ItemTypes {
    currency = 'currency',
    essence = 'essence',
    divination = 'divination'
}

export enum NinjaOverviewItemTypes {
    Essence = 'Essence',
    DivinationCard = 'DivinationCard',
    Prophecy = 'Prophecy',
    SkillGem = 'SkillGem',
    HelmetEnchant = 'HelmetEnchant',
    UniqueMap = 'UniqueMap',
    Map = 'Map',
    UniqueJewel = 'UniqueJewel',
    UniqueFlask = 'UniqueFlask',
    UniqueWeapon = 'UniqueWeapon',
    UniqueArmour = 'UniqueArmour',
    UniqueAccessory = 'UniqueAccessory'
}

export enum NinjaOverviewCurrencyTypes {
    Currency = 'Currency',
    Fragment = 'Fragment'
}
