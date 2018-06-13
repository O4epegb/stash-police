import { Sparkline, NinjaOverviewCurrencyTypes } from './common';

interface CurrencyDetails {
    id: number;
    icon: string;
    name: string;
    poeTradeId: number;
}

export interface CurrencyItemApi {
    currencyTypeName: string;
    chaosEquivalent: number;
    pay: Pay;
    receive: Pay;
    paySparkLine: Sparkline;
    receiveSparkLine: Sparkline;
}

export interface CurrencyItem extends CurrencyItemApi {
    type: NinjaOverviewCurrencyTypes.Currency;
}

interface Pay {
    id: number;
    league_id: number;
    pay_currency_id: number;
    get_currency_id: number;
    sample_time_utc: string;
    count: number;
    value: number;
    data_point_count: number;
    includes_secondary: boolean;
}

export interface CurrencyOverviewApi {
    lines: CurrencyItemApi[];
    currencyDetails: CurrencyDetails[];
}
