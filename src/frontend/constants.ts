export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;

export const poeCookieName = 'POESESSID';

export enum Time {
    Second = 1000,
    Minute = Time.Second * 60,
    Hour = Time.Minute * 60
}

export enum Routes {
    Startup = '/',
    Main = '/main',
    Login = '/login',
    Report = '/reports/:id',
    ReportsCreate = '/create-report'
}

export enum Colors {
    blue = '#205B9C',
    red = '#c53b12',
    brightBlue = '#00C8FE',
    brightRed = '#FE0000',
    textDark = '#3b2c1b',
    textBright = '#ffc077'
}

export enum ItemNames {
    ChaosOrb = 'Chaos Orb'
}

// request limit:interval(in seconds):timeout(in seconds)
// 45:60:60
export const getStashItemsDelay = isProduction ? 1350 : 100;

export enum ApiUrls {
    leagues = 'https://pathofexile.com/api/leagues?type=main&compact=1',
    index = 'https://pathofexile.com',
    login = 'https://pathofexile.com/login',
    myAccount = 'https://pathofexile.com/my-account',
    getStashItems = 'https://pathofexile.com/character-window/get-stash-items',
    ninjaCurrencyOverview = 'http://poe.ninja/api/data/currencyoverview',
    ninjaItemOverview = 'http://poe.ninja/api/data/itemoverview',
    ninjaGetCurrencyOverview = 'http://poe.ninja/api/Data/GetCurrencyOverview',
    ninjaGetFragmentOverview = 'http://poe.ninja/api/Data/GetFragmentOverview',
    ninjaGetEssenceOverview = 'http://poe.ninja/api/Data/GetEssenceOverview',
    ninjaGetDivinationCardsOverview = 'http://poe.ninja/api/Data/GetDivinationCardsOverview'

    // NINJA_UNIQUE_MAP_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueMapOverview',
    // NINJA_MAP_OVERVIEW = 'http://poe.ninja/api/Data/GetMapOverview',

    // NINJA_UNIQUE_JEWEL_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueJewelOverview',
    // NINJA_UNIQUE_FLASK_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueFlaskOverview',
    // NINJA_UNIQUE_WEAPON_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueWeaponOverview',
    // NINJA_UNIQUE_ARMOUR_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueArmourOverview',
    // NINJA_UNIQUE_ACCESSORY_OVERVIEW = 'http://poe.ninja/api/Data/GetUniqueAccessoryOverview'
}
