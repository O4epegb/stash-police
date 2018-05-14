import * as React from 'react';
import { observer } from 'mobx-react';

import * as m from '../models';
import { createNewReport, getTabsByLeague, getLeagues } from '../services';
import { isRemoveOnlyTab, pluralize, generateAffixedName } from '../utils';
import { Store } from '../Store';
import { getStashItemsDelay } from '../constants';

interface Props {
    onReportCreate: (report: m.Report) => any;
}

interface State {
    reportName: string;
    leagues: m.Leagues;
    selectedLeague: m.League;
    tabs: Array<m.Tab & { isSelected: boolean }>;
    isCreatingReport: boolean;
    isFetchingLeagues: boolean;
    isFetchingTabs: boolean;
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
            isCreatingReport: false,
            isFetchingLeagues: false,
            isFetchingTabs: false
        };
    }

    componentDidMount() {
        this.setState({ isFetchingLeagues: true });

        getLeagues().then(leagues => {
            this.setState({
                leagues: leagues.filter(league => !league.isSsf),
                isFetchingLeagues: false
            });
        });
    }

    selectLeague = (league: m.League) => {
        this.setState({ isFetchingTabs: true, selectedLeague: league });

        getTabsByLeague(Store.accountName, league.id).then(tabs => {
            this.setState({
                isFetchingTabs: false,
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
        // TODO DYNAMIC REPORT NAME
        this.setState({ isCreatingReport: true });

        const reportName = this.state.reportName || this.getNewReportName();

        createNewReport({
            accountName: Store.accountName,
            league: this.state.selectedLeague,
            reportName,
            tabs: this.state.tabs.filter(t => t.isSelected),
            updater: ({ totalTabs, tab, done }) => {
                console.warn(`processing ${tab.n}`);
            }
        }).then(report => {
            Store.addReport(report);
            this.props.onReportCreate(report);
        });
    };

    selectTab = (tab: m.Tab & { isSelected: boolean }) => {
        const newTabs = this.state.tabs.map(t => {
            if (t.id === tab.id) {
                t.isSelected = !tab.isSelected;
            }

            return t;
        });

        this.setState({
            tabs: newTabs
        });
    };

    selectAllTo = (bool: boolean) => {
        this.setState({
            tabs: this.state.tabs.map(t => {
                return {
                    ...t,
                    isSelected: bool
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
        const {
            leagues,
            tabs,
            selectedLeague,
            isFetchingLeagues,
            isFetchingTabs,
            isCreatingReport
        } = this.state;

        const selectedTabs = tabs && tabs.filter(tab => tab.isSelected);
        const showWarning = selectedTabs && selectedTabs.length === 0;
        const timeToGetInfo =
            selectedTabs &&
            Math.ceil(getStashItemsDelay * selectedTabs.length / 1000);

        return (
            <div className="create-report">
                {isCreatingReport && (
                    <div className="create-report__loader">Creating report</div>
                )}
                <h1>Create Report</h1>
                <div>
                    <div>Report name</div>
                    <input
                        type="text"
                        value={this.state.reportName}
                        onChange={this.onReportNameChange}
                    />
                    <div onClick={this.generateReportName}>generate</div>
                </div>
                {isFetchingLeagues && <div>Loading leagues</div>}
                {leagues &&
                    !selectedLeague && (
                        <div>
                            Select league:
                            {leagues.map(league => (
                                <div
                                    key={league.id}
                                    onClick={() => this.selectLeague(league)}
                                >
                                    {league.id}
                                </div>
                            ))}
                            <small>ssf leagues are excluded for now</small>
                        </div>
                    )}
                {selectedLeague && (
                    <div>
                        League: {selectedLeague.id}{' '}
                        {!isFetchingTabs && (
                            <button onClick={this.clearLeague}>X</button>
                        )}
                    </div>
                )}
                {isFetchingTabs && <div>Loading Tabs</div>}
                {tabs && (
                    <div>
                        <div>
                            <button
                                disabled={showWarning}
                                onClick={this.createReport}
                            >
                                Create Report
                            </button>
                            {showWarning && (
                                <span>You need to select at least one tab</span>
                            )}
                            <div>
                                <button onClick={() => this.selectAllTo(true)}>
                                    Select all
                                </button>
                                <button onClick={() => this.selectAllTo(false)}>
                                    Deselect all
                                </button>
                            </div>
                        </div>
                        Analyze {selectedTabs.length} of {tabs.length} tabs{' '}
                        {selectedTabs.length > 0 && (
                            <span>
                                (will take approximately {timeToGetInfo}{' '}
                                {pluralize(timeToGetInfo, 'second', 'seconds')})
                            </span>
                        )}
                        :
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                style={{
                                    backgroundColor: tab.color,
                                    color: tab.textColor,
                                    padding: '0 8px'
                                }}
                                onClick={() => this.selectTab(tab)}
                            >
                                {tab.isSelected ? '+ ' : ''}
                                {tab.n}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}