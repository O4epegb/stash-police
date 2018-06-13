import { Sparkline, NinjaOverviewCurrencyTypes } from './common';

export interface FragmentOverviewApi {
    lines: FragmentItemApi[];
    currencyDetails: FragmentDetailsItem[];
}

export interface FragmentItemApi {
    currencyTypeName: string;
    pay: Pay | null;
    receive: Pay;
    paySparkLine: Sparkline;
    receiveSparkLine: Sparkline;
    chaosEquivalent: number;
    lowConfidencePaySparkLine: Sparkline;
    lowConfidenceReceiveSparkLine: Sparkline;
}

export interface FragmentItem extends FragmentItemApi {
    type: NinjaOverviewCurrencyTypes.Fragment;
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

interface FragmentDetailsItem {
    id: number;
    icon: string;
    name: string;
    poeTradeId: number;
}
