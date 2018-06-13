import * as React from 'react';
import { observer } from 'mobx-react';
import posed, { PoseGroup } from 'react-pose';
import * as classnames from 'classnames';

import * as m from '../models';
import { createNewReport, getTabsByLeague, getLeagues } from '../services';
import { isRemoveOnlyTab, generateAffixedName } from '../utils';
import { Store } from '../Store';
import { getStashItemsDelay } from '../constants';
import { GearLoader } from '../components/GearLoader';

const LeagueItem = posed.div({
    preenter: {
        translateY: '200%',
        opacity: 0
    },
    enter: {
        translateY: '0%',
        opacity: 1
    },
    exit: {
        translateY: '-200%',
        opacity: 0
    }
});

interface Props {
    onReportCreate: (report: m.Report) => any;
}

interface State {
    reportName: string;
    leagues: m.Leagues;
    selectedLeague: m.League;
    tabs: Array<m.Tab & { isSelected: boolean }>;
    loaderText: string;
}

@observer
export class CreateReportPage extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            reportName: this.getNewReportName(),
            leagues: null,
            selectedLeague: null,
            tabs: null,
            loaderText: ''
        };
    }

    componentDidMount() {
        this.setState({ loaderText: 'Loading leagues' });

        getLeagues().then(leagues => {
            this.setState({
                leagues: leagues.filter(league => !league.isSsf),
                loaderText: ''
            });
        });
    }

    selectLeague = (league: m.League) => {
        this.setState({ loaderText: 'Loading tabs', selectedLeague: league });

        getTabsByLeague(Store.accountName, league.id).then(tabs => {
            this.setState({
                loaderText: '',
                tabs: tabs.map(tab => {
                    return {
                        ...tab,
                        isSelected: !isRemoveOnlyTab(tab)
                    };
                })
            });
        });
    };

    createReport = () => {
        const reportName = this.state.reportName || this.getNewReportName();
        Store.setLayoutLoaderText(`Creating Report "${reportName}"`);

        createNewReport({
            accountName: Store.accountName,
            league: this.state.selectedLeague,
            reportName,
            tabs: this.state.tabs.filter(t => t.isSelected),
            updater: ({ totalTabsNumber, tab, processedTabsNumber }) => {
                Store.setLayoutLoaderText(
                    `Fetched tab "${
                        tab.n
                    }" (${processedTabsNumber}/${totalTabsNumber})`
                );
            }
        })
            .then(report => {
                Store.addReport(report);
                this.props.onReportCreate(report);
            })
            .catch(err => {
                console.log(err);
            })
            .then(() => {
                Store.setLayoutLoaderText();
            });
    };

    selectTab = (tab: m.Tab & { isSelected: boolean }) => {
        this.setState({
            tabs: this.state.tabs.map(t => {
                if (t.id === tab.id) {
                    t.isSelected = !tab.isSelected;
                }

                return t;
            })
        });
    };

    selectAllTabsToBoolean = (bool: boolean) => {
        this.setState({
            tabs: this.state.tabs.map(t => {
                return {
                    ...t,
                    isSelected: bool
                };
            })
        });
    };

    selectAllCurrencyTabs = () => {
        this.setState({
            tabs: this.state.tabs.map(t => {
                return {
                    ...t,
                    isSelected: t.type === m.TabType.CurrencyStash
                };
            })
        });
    };

    selectTabsByType = (type: m.TabType) => {
        this.setState({
            tabs: this.state.tabs.map(t => {
                return {
                    ...t,
                    isSelected: t.isSelected || t.type === type
                };
            })
        });
    };

    getNewReportName = () => {
        return generateAffixedName('Report');
    };

    generateReportName = () => {
        this.setState({
            reportName: this.getNewReportName()
        });
    };

    onReportNameChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
        this.setState({
            reportName: e.currentTarget.value
        });
    };

    clearLeague = () => {
        this.setState({ selectedLeague: null, tabs: null });
    };

    render() {
        const { leagues, tabs, selectedLeague, loaderText } = this.state;

        const selectedTabs = tabs && tabs.filter(tab => tab.isSelected);
        const showWarning = selectedTabs && selectedTabs.length === 0;
        const timeToGetInfo =
            selectedTabs &&
            Math.ceil((getStashItemsDelay * selectedTabs.length) / 1000);
        const leaguesToShow = selectedLeague
            ? leagues.filter(l => l.id === selectedLeague.id)
            : leagues;

        const isLoading = Boolean(loaderText);

        return (
            <div className="create-report">
                <div className="create-report__header">
                    <h2>Create Report</h2>
                </div>
                <div className="create-report__name">
                    <input
                        type="text"
                        className="create-report__name-input"
                        placeholder="Report name"
                        value={this.state.reportName}
                        onChange={this.onReportNameChange}
                    />
                    <button
                        className="create-report__name-generate"
                        onClick={this.generateReportName}
                    >
                        Generate name
                    </button>
                </div>
                {leagues && (
                    <div className="leagues">
                        <div className="leagues__title">
                            {selectedLeague ? 'League:' : 'Select league:'}
                        </div>
                        <div className="leagues__list">
                            <PoseGroup animateOnMount preEnterPose="preenter">
                                {leaguesToShow.map(league => (
                                    <LeagueItem
                                        key={league.id}
                                        className={`leagues__item leagues__item_${
                                            league.isHardcore ? 'hc' : 'sc'
                                        }`}
                                        onClick={() => {
                                            if (!selectedLeague) {
                                                this.selectLeague(league);
                                            }
                                        }}
                                    >
                                        {league.id}
                                    </LeagueItem>
                                ))}
                            </PoseGroup>
                            {selectedLeague &&
                                !isLoading && (
                                    <div
                                        className="leagues__clear-league"
                                        onClick={this.clearLeague}
                                    >
                                        X
                                    </div>
                                )}
                        </div>
                    </div>
                )}
                {tabs && (
                    <div className="create-report__content">
                        <div className="create-report__controls">
                            <button
                                disabled={showWarning}
                                className="create-report__create-button"
                                onClick={this.createReport}
                            >
                                Create Report
                                {showWarning && (
                                    <div className="create-report__create-button-warning">
                                        You need to select at least one tab
                                    </div>
                                )}
                            </button>
                            <div className="create-report__button-list">
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectAllTabsToBoolean(true)
                                    }
                                >
                                    Select all
                                </button>
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectAllTabsToBoolean(false)
                                    }
                                >
                                    Deselect all
                                </button>
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectTabsByType(
                                            m.TabType.CurrencyStash
                                        )
                                    }
                                >
                                    Select Currency tabs
                                </button>
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectTabsByType(
                                            m.TabType.EssenceStash
                                        )
                                    }
                                >
                                    Select Essence tabs
                                </button>
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectTabsByType(
                                            m.TabType.DivinationCardStash
                                        )
                                    }
                                >
                                    Select Divination tabs
                                </button>
                                <button
                                    className="create-report__button"
                                    onClick={() =>
                                        this.selectTabsByType(
                                            m.TabType.FragmentStash
                                        )
                                    }
                                >
                                    Select Fragment tabs
                                </button>
                            </div>
                        </div>

                        <div className="create-report__tabs">
                            <div className="create-report__tabs-title">
                                <div>
                                    {selectedTabs.length}/{tabs.length} tabs{' '}
                                    {selectedTabs.length > 0 && (
                                        <span>
                                            (at least {timeToGetInfo}s to
                                            analyze)
                                        </span>
                                    )}
                                    :
                                </div>
                            </div>
                            <div className="create-report__tabs-list">
                                {tabs.map(tab => (
                                    <div
                                        key={tab.id}
                                        className="create-report__tab"
                                        onClick={() => this.selectTab(tab)}
                                    >
                                        <div
                                            className={classnames(
                                                'create-report__tab-checkbox',
                                                {
                                                    'create-report__tab-checkbox_active':
                                                        tab.isSelected
                                                }
                                            )}
                                        />
                                        <div
                                            className="create-report__tab-info"
                                            style={{
                                                backgroundColor: tab.color,
                                                color: tab.textColor
                                            }}
                                        >
                                            {tab.n}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className="create-report__loader">
                        <div className="create-report__loader-text">
                            {loaderText}
                        </div>
                        <GearLoader />
                    </div>
                )}
            </div>
        );
    }
}
