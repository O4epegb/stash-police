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
    ninjaItemOverview = 'http://poe.ninja/api/data/itemoverview'
}
