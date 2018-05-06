import * as React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import { formatDate, DateFormats, getTotalItemsValue } from '../utils';
import { Routes } from '../config';
import { Store } from '../Store';

@observer
export class ReportsPage extends React.Component {
    render() {
        const { reports } = Store;

        return (
            <div>
                {reports.length > 0 ? (
                    <div>
                        <h3>Reports</h3>
                        {reports.map(report => {
                            return (
                                <React.Fragment key={report.id}>
                                    <div key={report.id}>
                                        <Link
                                            to={Routes.Report.replace(
                                                ':id',
                                                report.id
                                            )}
                                        >
                                            {report.name}
                                        </Link>,{' '}
                                        {formatDate(
                                            report.createdAt,
                                            DateFormats.DefaultWithTime
                                        )}
                                        <br />
                                        Total value:{' '}
                                        {getTotalItemsValue(
                                            _.last(report.checkouts).items
                                        )}
                                        <br />
                                        Checkouts: {report.checkouts.length}
                                        <br />
                                        Tabs: {report.lastProccessedTabs.length}
                                    </div>
                                    <br />
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div>You have no reports</div>
                )}
            </div>
        );
    }
}
