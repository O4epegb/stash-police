import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import posed, { PoseGroup } from 'react-pose';
import { tween } from 'popmotion';
import * as classnames from 'classnames';

import { getTotalItemsValue, pluralize } from '../utils';
import { Routes } from '../constants';
import { Report } from '../models';
import { Store } from '../Store';
import { NumericValue, CurrencyValue } from './Value';
import { DateValue } from '../components/DateValue';

const ReportsItem = posed.div({
    enter: {
        translateX: '0%',
        opacity: 1,
        transition: props => tween({ ...props, duration: 200 })
    },
    exit: {
        translateX: '-100%',
        opacity: 0,
        transition: props => tween({ ...props, duration: 200 })
    }
});

type Props = RouteComponentProps<any> & {};

@observer
export class Reports extends React.Component<Props, {}> {
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

    render() {
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
                <h3 className="reports__title">Reports</h3>
                <div className="reports__list">
                    <PoseGroup animateOnMount={false}>
                        {reports.map(report => (
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
