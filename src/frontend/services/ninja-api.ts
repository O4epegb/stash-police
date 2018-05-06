import axios from 'axios';

import * as m from '../models';
import { formatDate, DateFormats } from '../utils';
import { ApiUrls } from '../config';

export interface NinjaApiParams {
    league: string;
    date?: string;
}

function requestNinjaApi<T>(url: ApiUrls, params: NinjaApiParams) {
    return axios.get<T>(url, {
        params: {
            ...params,
            date: params.date || formatDate(new Date(), DateFormats.NinjaDate)
        }
    });
}

export function getCurrencyOverview(params: NinjaApiParams) {
    return requestNinjaApi<m.CurrencyOverview>(
        ApiUrls.ninjaGetCurrencyOverview,
        params
    ).then(({ data }) => {
        const currencyOverview = data ? data.lines : [];

        return currencyOverview.reduce(
            (acc, item) => {
                acc[item.currencyTypeName] = item;
                return acc;
            },
            {} as Record<string, m.CurrencyItem>
        );
    });
}
