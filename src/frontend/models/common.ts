export interface Sparkline {
    data: number[] | (null | number)[];
    totalChange: number;
}

export interface ExplicitModifiersItem {
    text: string;
    optional: boolean;
}

export interface ImplicitModifiersItem {
    text: string;
}
