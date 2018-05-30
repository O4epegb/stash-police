import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import posed, { PoseGroup } from 'react-pose';
import { tween } from 'popmotion';

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

    render() {
        const { reports } = Store;

        if (reports.length === 0) {
            return (
                <div>
                    You have no reports
                    <div>
                        <Link to={Routes.ReportsCreate}>
                            Create first Report
                        </Link>
                    </div>
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
                                className="reports__item"
                            >
                                <h3>
                                    <Link
                                        to={Routes.Report.replace(
                                            ':id',
                                            report.id
                                        )}
                                    >
                                        {report.name}
                                    </Link>
                                </h3>
                                <div>{report.league.id}</div>
                                <div>
                                    Created{' '}
                                    <DateValue>{report.createdAt}</DateValue>
                                </div>
                                <div>
                                    Updated{' '}
                                    <DateValue>{report.updatedAt}</DateValue>
                                </div>
                                <div>
                                    <CurrencyValue
                                        value={getTotalItemsValue(
                                            _.last(report.checkouts).items
                                        )}
                                    />,{' '}
                                    <span>
                                        <NumericValue
                                            value={report.checkouts.length}
                                        />{' '}
                                        {pluralize(
                                            report.checkouts.length,
                                            'checkout',
                                            'checkouts'
                                        )}
                                    </span>,{' '}
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
