import * as url from 'url';
import { remote } from 'electron';
import * as uuidv4 from 'uuid/v4';
import * as _ from 'lodash';
import * as format from 'date-fns/format';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

import { Tab, CheckoutItems } from '../models';
import { prefixes, suffixes } from '../data';
import { ApiUrls, poeCookieName } from '../constants';
import { updateSettings } from '../../common';

export * from './disk-utils';

export const uuid = uuidv4;

export function delay(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isColorBright(r: number, g: number, b: number): boolean {
    const luma = (r * 299 + g * 587 + b * 114) / 1000;
    return luma >= 128;
}

export enum DateFormats {
    Default = 'DD.MM.YYYY',
    DefaultWithTime = 'DD.MM.YYYY, HH:mm',
    PoeNinjaApi = 'YYYY-MM-DD'
}

export function formatDate(
    date: string | number | Date,
    formatString = DateFormats.Default
) {
    return format(date, formatString);
}

export function humanizeDate(date: string | number | Date, addSuffix = true) {
    return distanceInWordsToNow(date, { addSuffix });
}

export function isRemoveOnlyTab(tab: Tab): boolean {
    return tab.n.includes('(Remove-only)');
}

export function getTotalItemsValue(items: CheckoutItems) {
    return _.reduce(items, (acc, item) => acc + item.cost, 0);
}

export function pluralize(count: number, one: string, many: string): string {
    return count !== 1 ? many : one;
}

export function generateAffixedName(name: string): string {
    const prefix = prefixes[_.random(prefixes.length - 1)];
    const suffix = suffixes[_.random(suffixes.length - 1)];

    return `${prefix} ${name} ${suffix}`;
}

export function setSessionIdCookie(sessionId: string) {
    return new Promise((resolve, reject) => {
        const cookie = {
            url: ApiUrls.index,
            name: poeCookieName,
            value: sessionId,
            domain: url.parse(ApiUrls.index).host
        };

        if (remote.session.defaultSession) {
            remote.session.defaultSession.cookies.set(cookie, error => {
                if (error) {
                    console.error(error);
                    return reject();
                }

                updateSettings({ sessionId });

                return resolve();
            });
        } else {
            return reject();
        }
    });
}

export function removeSessionIdCookie() {
    return new Promise((resolve, reject) => {
        if (remote.session.defaultSession) {
            remote.session.defaultSession.cookies.remove(
                ApiUrls.index,
                poeCookieName,
                (error: any) => {
                    if (error) {
                        console.error(error);
                        return reject();
                    }

                    updateSettings({ sessionId: '' });

                    return resolve();
                }
            );
        } else {
            return reject();
        }
    });
}
