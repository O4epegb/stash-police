import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import posed, { PoseGroup } from 'react-pose';
import * as classnames from 'classnames';

import { getTotalItemsValue, pluralize } from '../utils';
import { Routes } from '../constants';
import { Report, Reports } from '../models';
import { Store } from '../Store';
import { NumericValue, CurrencyValue } from './Value';
import { DateValue } from '../components/DateValue';

const ReportsItem = posed.div({
    enter: {
        translateX: '0%',
        opacity: 1
    },
    exit: {
        translateX: '-100%',
        opacity: 0
    }
});

type Props = RouteComponentProps<any> & {};

interface State {
    sortAscending: boolean;
    showHc: boolean;
    showSc: boolean;
}

@observer
export class ReportsList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            sortAscending: false,
            showHc: true,
            showSc: true
        };
    }

    deleteReport = (report: Report) => {
        const { activeReport } = Store;

        if (activeReport && report.id === activeReport.id) {
            this.props.history.push(Routes.Main);
        }

        Store.deleteReport(report);
    };

    onReportClick = (report: Report) => {
        if (Store.activeReport === report) {
            this.props.history.push(Routes.Main);
            Store.setActiveReport(null);
        } else {
            this.props.history.push(Routes.Report.replace(':id', report.id));
        }
    };

    onCreateReportClick = () => {
        this.props.history.push(Routes.ReportsCreate);
    };

    sortAndFilterReports = (reports: Reports) => {
        const { sortAscending, showHc, showSc } = this.state;

        return _.orderBy(
            reports,
            report => new Date(report.createdAt).getTime(),
            sortAscending ? 'asc' : 'desc'
        ).filter(report => {
            return (
                showHc === showSc ||
                (showHc && report.league.isHardcore) ||
                (showSc && !report.league.isHardcore)
            );
        });
    };

    toggleSort = () => {
        this.setState({ sortAscending: !this.state.sortAscending });
    };

    toggleShowHc = () => {
        this.setState({ showHc: !this.state.showHc });
    };

    toggleShowSc = () => {
        this.setState({ showSc: !this.state.showSc });
    };

    render() {
        const { showHc, showSc, sortAscending } = this.state;
        const { reports } = Store;

        if (reports.length === 0) {
            return (
                <div className="reports">
                    You have no reports
                    <button
                        className="reports__new-report-button"
                        onClick={this.onCreateReportClick}
                    >
                        Create first Report
                    </button>
                </div>
            );
        }

        return (
            <div className="reports">
                <div className="reports__header">
                    <h3 className="reports__title">Reports</h3>
                    <div className="reports__controls">
                        <div className="reports__leagues-filter">
                            <div
                                className={classnames(
                                    'reports__leagues-filter-item reports__leagues-filter-item_hc',
                                    {
                                        'reports__leagues-filter-item_disabled': !showHc
                                    }
                                )}
                                onClick={this.toggleShowHc}
                            >
                                HC
                            </div>
                            <div className="reports__leagues-filter-separator">
                                /
                            </div>
                            <div
                                className={classnames(
                                    'reports__leagues-filter-item reports__leagues-filter-item_sc',
                                    {
                                        'reports__leagues-filter-item_disabled': !showSc
                                    }
                                )}
                                onClick={this.toggleShowSc}
                            >
                                SC
                            </div>
                        </div>
                        <div
                            className={classnames('reports__date-sort', {
                                'reports__date-sort_asc': sortAscending
                            })}
                            onClick={this.toggleSort}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                            >
                                <path d="M7 10l5 5 5-5z" />
                                <path d="M0 0h24v24H0z" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="reports__list">
                    <PoseGroup animateOnMount={false}>
                        {this.sortAndFilterReports(reports).map(report => (
                            <ReportsItem
                                key={report.id}
                                className={classnames('reports__item', {
                                    reports__item_active:
                                        Store.activeReport === report
                                })}
                                onClick={() => this.onReportClick(report)}
                            >
                                <h3 className="reports__item-name">
                                    {report.name}
                                </h3>
                                <div
                                    className={classnames(
                                        'reports__item-league',
                                        'league-name',
                                        {
                                            'league-name_hc':
                                                report.league.isHardcore,
                                            'league-name_sc': !report.league
                                                .isHardcore
                                        }
                                    )}
                                >
                                    {report.league.id}
                                </div>
                                <div>
                                    Created{' '}
                                    <DateValue>{report.createdAt}</DateValue>
                                </div>
                                <div>
                                    Updated{' '}
                                    <DateValue>{report.updatedAt}</DateValue>
                                </div>
                                <div>
                                    <span className="reports__item-value">
                                        <CurrencyValue
                                            value={getTotalItemsValue(
                                                _.last(report.checkouts).items
                                            )}
                                        />,{' '}
                                    </span>
                                    <span>
                                        <NumericValue
                                            value={report.checkouts.length}
                                        />{' '}
                                        {pluralize(
                                            report.checkouts.length,
                                            'checkout',
                                            'checkouts'
                                        )}
                                        ,{' '}
                                    </span>
                                    <span>
                                        <NumericValue
                                            value={
                                                report.lastProccessedTabs.length
                                            }
                                        />{' '}
                                        {pluralize(
                                            report.lastProccessedTabs.length,
                                            'tab',
                                            'tabs'
                                        )}
                                    </span>
                                </div>
                            </ReportsItem>
                        ))}
                    </PoseGroup>
                </div>
            </div>
        );
    }
}
