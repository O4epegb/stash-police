import axios from 'axios';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

import * as m from '../models';
import { delay, isColorBright, uuid, isRemoveOnlyTab } from '../utils';
import { getStashItemsDelay, Colors, ApiUrls, ItemNames } from '../constants';
import * as ninjaApi from './ninja-api';

export function getLeagues() {
    return axios.get<m.ApiLeagues>(ApiUrls.leagues).then(response => {
        return response.data.map(league => {
            return {
                ...league,
                isHardcore: league.id.toLowerCase().includes('hardcore'),
                isSsf: league.id.toLowerCase().includes('ssf')
            };
        });
    });
}

export function login() {
    return axios.get(ApiUrls.login);
}

export function getAccountInfo() {
    return axios.get(ApiUrls.myAccount).then(response => {
        const html = cheerio(response.data);

        const accountName = html
            .find('a[href^="/account/view-profile"]')
            .first()
            .text();
        const avatarUrl = html.find('.avatar > img').attr('src');

        if (!accountName) {
            throw new Error('login failed');
        } else {
            return {
                accountName,
                avatarUrl
            };
        }
    });
}

function getStashItems(params: {
    accountName: string;
    tabIndex?: number;
    tabs: 0 | 1;
    league: string;
}): Promise<m.StashItemsData> {
    return axios
        .get<m.StashItemsDataApi>(ApiUrls.getStashItems, {
            params
        })
        .then(response => {
            const tabs = !response.data.tabs
                ? null
                : response.data.tabs.map(tab => {
                      const { r, g, b } = tab.colour;

                      return {
                          ...(_.omit(tab, [
                              'srcC',
                              'srcL',
                              'srcR',
                              'hidden',
                              'colour',
                              'selected'
                          ]) as m.Tab),
                          textColor: isColorBright(r, g, b)
                              ? Colors.textDark
                              : Colors.textBright,
                          color: `rgb(${r},${g},${b})`
                      };
                  });

            return {
                ...response.data,
                tabs
            };
        });
}

export interface ProcessedTabsData {
    totalTabs: number;
    done: boolean;
    tab: m.Tab;
}

export type ProcessedTabsDataUpdater = (data: ProcessedTabsData) => any;

export function getTabsByLeague(accountName: string, league: string) {
    return getStashItems({
        accountName,
        tabs: 1,
        league
    }).then(response => _.sortBy(response.tabs, isRemoveOnlyTab));
}

export function getItemsByTab(
    accountName: string,
    league: string,
    tabsToProccess: m.Tabs = [],
    updater?: ProcessedTabsDataUpdater
) {
    // TODO add dynamic rate limit
    return getTabsByLeague(accountName, league).then(tabs => {
        const filteredTabs =
            tabsToProccess.length === 0
                ? tabs
                : tabs.filter(tab => {
                      return tabsToProccess.find(t => t.id === tab.id);
                  });

        const promisedItemsByTab = filteredTabs.map((currentTab, index) => {
            return delay(getStashItemsDelay * index)
                .then(() =>
                    getStashItems({
                        accountName,
                        tabIndex: currentTab.i,
                        tabs: 0,
                        league
                    })
                )
                .then(tabData => {
                    if (updater) {
                        updater({
                            totalTabs: tabs.length,
                            done: tabs.length === index + 1,
                            tab: currentTab
                        });
                    }

                    return {
                        tab: currentTab,
                        items: tabData.items
                    };
                });
        });

        return Promise.all(promisedItemsByTab);
    });
}

export function createNewReport({
    accountName,
    league,
    reportName,
    tabs = [],
    updater = () => void 0
}: {
    accountName: string;
    league: m.League;
    reportName: string;
    tabs?: m.Tabs;
    updater?: ProcessedTabsDataUpdater;
}): Promise<m.Report> {
    return createCheckout({
        accountName,
        league,
        tabs,
        updater
    }).then(checkout => {
        const report: m.Report = {
            league,
            name: reportName,
            id: uuid(),
            createdAt: checkout.createdAt,
            updatedAt: checkout.createdAt,
            lastProccessedTabs: checkout.tabs,
            checkouts: [checkout]
        };

        return report;
    });
}

export function createCheckout({
    accountName,
    league,
    tabs = [],
    updater = () => void 0
}: {
    accountName: string;
    league: m.League;
    tabs?: m.Tabs;
    updater?: ProcessedTabsDataUpdater;
}): Promise<m.Checkout> {
    const leagueId = league.id;

    return Promise.all([
        ninjaApi.getCurrencyOverview({ league: leagueId }),
        getItemsByTab(accountName, leagueId, tabs, updater)
    ]).then(([currencyOverview, tabsWithItems]) => {
        const tabsUsed = tabsWithItems.map(t => t.tab);

        const currency = _.flatten(
            tabsWithItems.map(tab => {
                return tab.items.filter(
                    item =>
                        currencyOverview[item.typeLine] ||
                        item.typeLine === ItemNames.ChaosOrb
                );
            })
        );

        const currencyByName: m.CheckoutItems = {};

        currency.forEach(item => {
            const { typeLine: currencyName, stackSize } = item;

            if (!currencyByName[currencyName]) {
                currencyByName[currencyName] = {
                    stackSize: 0,
                    cost: 0,
                    name: currencyName,
                    originalItem: item
                };
            }

            const newStackSize =
                currencyByName[currencyName].stackSize + stackSize;
            const chaosEquivalent =
                currencyName === ItemNames.ChaosOrb
                    ? 1
                    : currencyOverview[currencyName].chaosEquivalent;

            currencyByName[currencyName] = {
                ...currencyByName[currencyName],
                stackSize: newStackSize,
                cost: newStackSize * chaosEquivalent
            };
        });

        const dateString = new Date().toISOString();

        const checkout: m.Checkout = {
            id: uuid(),
            createdAt: dateString,
            items: currencyByName,
            tabs: tabsUsed
        };

        return checkout;
    });
}
