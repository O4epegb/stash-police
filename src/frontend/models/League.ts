export type Leagues = Array<League>;

export type ApiLeagues = Array<ApiLeague>;

export interface League extends ApiLeague {
    isHardcore: boolean;
}

export interface ApiLeague {
    id: string;
    url: string;
    startAt: string;
    endAt: null | string;
}
