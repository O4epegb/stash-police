import { Sparkline } from './common';

export interface CurrencyDetails {
    id: number;
    icon: string;
    name: string;
    poeTradeId: number;
}

export interface CurrencyItem {
    currencyTypeName: string;
    pay: Pay;
    receive: Pay;
    paySparkLine: Sparkline;
    receiveSparkLine: Sparkline;
    chaosEquivalent: number;
}

export interface Pay {
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

export interface CurrencyOverview {
    lines: CurrencyItem[];
    currencyDetails: CurrencyDetails[];
}
