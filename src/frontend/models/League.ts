export type Leagues = Array<League>;

export type ApiLeagues = Array<ApiLeague>;

export interface League extends ApiLeague {
    isHardcore: boolean;
    isSsf: boolean;
}

export interface ApiLeague {
    id: string;
    url: string;
    startAt: string;
    endAt: null | string;
}
