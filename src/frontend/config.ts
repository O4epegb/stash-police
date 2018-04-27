import * as path from 'path';
import { remote } from 'electron';

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;

export const poeCookieName = 'POESESSID';

export enum Routes {
    Main = '/',
    Login = '/login',
    Reports = '/reports',
    Report = '/reports/:id',
    ReportsCreate = '/create-report'
}

export enum Colors {
    blue = '#205B9C',
    red = '#7B0C10',
    brightBlue = '#00C8FE',
    brightRed = '#FE0000',
    textDark = '#3b2c1b',
    textBright = '#ffc077'
}

export enum FileNames {
    Settings = 'stash-police-settings.json',
    Reports = 'stash-police-reports.json'
}

export const userDataPath = remote.app.getPath('userData');
export const settingsPath = path.join(userDataPath, FileNames.Settings);
export const reportsPath = path.join(userDataPath, FileNames.Reports);

export enum ItemNames {
    ChaosOrb = 'Chaos Orb'
}

// request limit:interval(in seconds):timeout(in seconds)
// 45:60:60
export const getStashItemsDelay = isProduction ? 1350 : 100;

export enum ApiUrls {
    leagues = 'http://api.pathofexile.com/leagues?type=main&compact=1',
    index = 'https://pathofexile.com',
    login = 'https://pathofexile.com/login',
    myAccount = 'https://pathofexile.com/my-account',
    getStashItems = 'https://pathofexile.com/character-window/get-stash-items',
    ninjaGetCurrencyOverview = 'http://api.poe.ninja/api/Data/GetCurrencyOverview'

    // POE_LOGIN_STEAM = 'https://pathofexile.com/login/steam',
    // POE_MAIN_PAGE = 'https://pathofexile.com/',
    // POE_GET_CHARACTERS = 'https://pathofexile.com/character-window/get-characters',

    // NINJA_FRAGMENT_OVERVIEW = 'http://api.poe.ninja/api/Data/GetFragmentOverview',
    // NINJA_ESSENCE_OVERVIEW = 'http://api.poe.ninja/api/Data/GetEssenceOverview',

    // NINJA_UNIQUE_MAP_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueMapOverview',
    // NINJA_DIV_CARDS_OVERVIEW = 'http://api.poe.ninja/api/Data/GetDivinationCardsOverview',
    // NINJA_MAP_OVERVIEW = 'http://api.poe.ninja/api/Data/GetMapOverview',

    // NINJA_UNIQUE_JEWEL_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueJewelOverview',
    // NINJA_UNIQUE_FLASK_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueFlaskOverview',
    // NINJA_UNIQUE_WEAPON_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueWeaponOverview',
    // NINJA_UNIQUE_ARMOUR_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueArmourOverview',
    // NINJA_UNIQUE_ACCESSORY_OVERVIEW = 'http://api.poe.ninja/api/Data/GetUniqueAccessoryOverview'
}
