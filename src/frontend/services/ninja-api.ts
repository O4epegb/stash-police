import axios from 'axios';

import * as m from '../models';
import { formatDate, DateFormats } from '../utils';
import { ApiUrls } from '../constants';

export interface GetOverviewParams {
    league: string;
    date?: string;
}

export interface NinjaCurrencyOverviewParams extends GetOverviewParams {
    type: m.NinjaOverviewCurrencyTypes;
}

export interface NinjaItemOverviewParams extends GetOverviewParams {
    type: m.NinjaOverviewItemTypes;
}

function requestNinjaCurrencyOverview<T>(params: NinjaCurrencyOverviewParams) {
    return axios.get<T>(ApiUrls.ninjaCurrencyOverview, {
        params: {
            date: formatDate(new Date(), DateFormats.PoeNinjaApi),
            ...params
        }
    });
}

function requestNinjaItemOverview<T>(params: NinjaItemOverviewParams) {
    return axios.get<T>(ApiUrls.ninjaItemOverview, {
        params: {
            date: formatDate(new Date(), DateFormats.PoeNinjaApi),
            ...params
        }
    });
}

function getGenericCurrencyOverview<
    K extends {
        currencyTypeName: string;
    },
    T extends K & {
        type: m.NinjaOverviewCurrencyTypes;
    },
    P extends {
        lines: Array<K>;
    }
>(type: m.NinjaOverviewCurrencyTypes, params: GetOverviewParams) {
    return requestNinjaCurrencyOverview<P>({
        ...params,
        type
    }).then(({ data }) => {
        const overview = data ? data.lines : [];

        return overview.reduce(
            (acc, item) => {
                const itemWithType = Object.assign({}, item, { type }) as T;
                acc[item.currencyTypeName] = itemWithType;
                return acc;
            },
            {} as Record<string, T>
        );
    });
}

function getGenericItemOverview<
    K extends {
        name: string;
    },
    T extends K & {
        type: m.NinjaOverviewItemTypes;
    },
    P extends {
        lines: Array<K>;
    }
>(type: m.NinjaOverviewItemTypes, params: GetOverviewParams) {
    return requestNinjaItemOverview<P>({
        ...params,
        type
    }).then(({ data }) => {
        const overview = data ? data.lines : [];

        return overview.reduce(
            (acc, item) => {
                const itemWithType = Object.assign({}, item, { type }) as T;
                acc[item.name] = itemWithType;
                return acc;
            },
            {} as Record<string, T>
        );
    });
}

export function getCurrencyOverview(params: GetOverviewParams) {
    return getGenericCurrencyOverview<
        m.CurrencyItemApi,
        m.CurrencyItem,
        m.CurrencyOverviewApi
    >(m.NinjaOverviewCurrencyTypes.Currency, params);
}

export function getFragmentOverview(params: GetOverviewParams) {
    return getGenericCurrencyOverview<
        m.FragmentItemApi,
        m.FragmentItem,
        m.FragmentOverviewApi
    >(m.NinjaOverviewCurrencyTypes.Fragment, params);
}

export function getEssenceOverview(params: GetOverviewParams) {
    return getGenericItemOverview<
        m.EssenceItemApi,
        m.EssenceItem,
        m.EssenceOverviewApi
    >(m.NinjaOverviewItemTypes.Essence, params);
}

export function getDivinationCardOverview(params: GetOverviewParams) {
    return getGenericItemOverview<
        m.DivinationCardItemApi,
        m.DivinationCardItem,
        m.DivinationCardOverviewApi
    >(m.NinjaOverviewItemTypes.DivinationCard, params);
}

export function getMapOverview(params: GetOverviewParams) {
    return getGenericItemOverview<m.MapItemApi, m.MapItem, m.MapOverviewApi>(
        m.NinjaOverviewItemTypes.Map,
        params
    );
}

export function getUniqueMapOverview(params: GetOverviewParams) {
    return getGenericItemOverview<
        m.MapItemApi,
        m.UniqueMapItem,
        m.UniqueMapOverviewApi
    >(m.NinjaOverviewItemTypes.UniqueMap, params);
}

export function getUniqueJewelOverview(params: GetOverviewParams) {
    return getGenericItemOverview<
        m.UniqueJewelItemApi,
        m.UniqueJewelItem,
        m.UniqueJewelOverviewApi
    >(m.NinjaOverviewItemTypes.UniqueJewel, params);
}

export function getUniqueFlaskOverview(params: GetOverviewParams) {
    return getGenericItemOverview<
        m.UniqueFlaskItemApi,
        m.UniqueFlaskItem,
        m.UniqueFlaskOverviewApi
    >(m.NinjaOverviewItemTypes.UniqueFlask, params);
}
