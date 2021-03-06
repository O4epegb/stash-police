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
    totalTabsNumber: number;
    processedTabsNumber: number;
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
    return getTabsByLeague(accountName, league).then(tabs => {
        const filteredTabs =
            tabsToProccess.length === 0
                ? tabs
                : tabs.filter(tab => {
                      return tabsToProccess.find(t => t.id === tab.id);
                  });

        let processedTabsNumber = 0;

        const promisedItemsByTab = filteredTabs.map((currentTab, index) => {
            return delay(getStashItemsDelay * index)
                .then(() => {
                    return getStashItems({
                        accountName,
                        tabIndex: currentTab.i,
                        tabs: 0,
                        league
                    });
                })
                .then(tabData => {
                    processedTabsNumber = processedTabsNumber + 1;
                    if (updater) {
                        updater({
                            totalTabsNumber: filteredTabs.length,
                            processedTabsNumber,
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
    const ninjaApiParams = { league: leagueId };

    return Promise.all([
        getItemsByTab(accountName, leagueId, tabs, updater),
        ninjaApi.getCurrencyOverview(ninjaApiParams),
        ninjaApi.getEssenceOverview(ninjaApiParams),
        ninjaApi.getDivinationCardOverview(ninjaApiParams),
        ninjaApi.getFragmentOverview(ninjaApiParams),
        ninjaApi.getMapOverview(ninjaApiParams),
        ninjaApi.getUniqueMapOverview(ninjaApiParams),
        ninjaApi.getUniqueJewelOverview(ninjaApiParams),
        ninjaApi.getUniqueFlaskOverview(ninjaApiParams)
    ]).then(
        ([
            tabsWithItems,
            currencyOverview,
            essenceOverview,
            divinationCardOverview,
            fragmentOverview,
            mapOverview,
            uniqueMapOverview,
            uniqueJewelOverview,
            uniqueFlaskOverview
        ]) => {
            const itemsOverview = {
                ...currencyOverview,
                ...essenceOverview,
                ...divinationCardOverview,
                ...fragmentOverview,
                ...mapOverview,
                ...uniqueMapOverview,
                ...uniqueJewelOverview,
                ...uniqueFlaskOverview
            };
            const tabsUsed = tabsWithItems.map(t => t.tab);

            const items = _.flatten(
                tabsWithItems.map(tab => {
                    return tab.items.filter(
                        item =>
                            itemsOverview[item.typeLine] ||
                            item.typeLine === ItemNames.ChaosOrb
                    );
                })
            );

            const itemsByName = items.reduce(
                (acc, item) => {
                    const { typeLine: itemName, stackSize = 1 } = item;

                    const itemObject = acc[itemName] || {
                        stackSize: 0,
                        cost: 0,
                        name: itemName,
                        originalItem: item
                    };

                    const newStackSize = itemObject.stackSize + stackSize;
                    const chaosEquivalent =
                        itemName === ItemNames.ChaosOrb
                            ? 1
                            : getChaosEquivalent(itemsOverview[itemName]);

                    acc[itemName] = {
                        ...itemObject,
                        stackSize: newStackSize,
                        cost: newStackSize * chaosEquivalent
                    };

                    return acc;
                },
                {} as m.CheckoutItems
            );

            const checkout: m.Checkout = {
                id: uuid(),
                createdAt: new Date().toISOString(),
                items: itemsByName,
                tabs: tabsUsed
            };

            return checkout;
        }
    );
}

function getChaosEquivalent<
    T extends {
        chaosEquivalent: number;
    },
    P extends {
        chaosValue: number;
    }
>(item: T | P): number {
    if ('chaosEquivalent' in item) {
        return item.chaosEquivalent;
    } else {
        return item.chaosValue;
    }
}
