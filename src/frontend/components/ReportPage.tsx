import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import * as classnames from 'classnames';

import * as m from '../models';
import { getLeagues, createCheckout } from '../services';
import {
    formatDate,
    humanizeDate,
    DateFormats,
    getTotalItemsValue
} from '../utils';
import { Routes } from '../constants';
import { Store } from '../Store';

type Props = RouteComponentProps<{ id: string }> & {};

interface State {
    selectedCheckoutId: string;
    isActiveLeague: boolean;
}

@observer
export class ReportPage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        Store.setActiveReport(props.match.params.id);

        console.log('active report', Store.activeReport);

        this.state = {
            selectedCheckoutId: null,
            isActiveLeague: false
        };
    }

    componentDidMount() {
        this.checkIfLeagueIsActive();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.setState({ isActiveLeague: false });
            Store.setActiveReport(this.props.match.params.id);
            this.checkIfLeagueIsActive();
        }
    }

    checkIfLeagueIsActive = () => {
        return getLeagues().then(leagues => {
            const isActiveLeague = leagues.find(
                league => league.id === Store.activeReport.league.id
            );

            this.setState({
                isActiveLeague: Boolean(isActiveLeague)
            });
        });
    };

    selectCheckout = (id: string) => {
        this.setState({
            selectedCheckoutId: this.state.selectedCheckoutId !== id ? id : null
        });
    };

    updateReport = () => {
        const { activeReport } = Store;

        createCheckout({
            accountName: Store.accountName,
            league: activeReport.league,
            tabs: activeReport.lastProccessedTabs,
            updater: ({ totalTabs, tab, done }) => {
                console.warn(`processing ${tab.n}`);
            }
        }).then(checkout => {
            console.log('created new checkout', checkout);
            const newReport: m.Report = {
                ...activeReport,
                updatedAt: checkout.createdAt,
                checkouts: [...activeReport.checkouts, checkout]
            };

            Store.updateReport(newReport);
            Store.setActiveReport(newReport.id);
        });
    };

    deleteReport = () => {
        const { activeReport } = Store;

        this.props.history.push(Routes.Main);
        Store.deleteReport(activeReport);
    };

    render() {
        const { selectedCheckoutId, isActiveLeague } = this.state;
        const { match } = this.props;

        const report = Store.activeReport;

        const selectedCheckout = report.checkouts.find(
            checkout => checkout.id === selectedCheckoutId
        );
        const selectedCheckoutIndex = report.checkouts.indexOf(
            selectedCheckout
        );

        if (!report) {
            return <div>Report with id {match.params.id} is not found</div>;
        }

        return (
            <div className="report">
                <h3>
                    Report {report.name}
                    <button onClick={this.deleteReport}>Delete</button>
                    {isActiveLeague && (
                        <button onClick={this.updateReport}>Update</button>
                    )}
                </h3>
                {formatDate(report.createdAt, DateFormats.DefaultWithTime)}
                <hr />
                {report.checkouts.length > 0 && (
                    <div className="checkouts__container">
                        <div className="checkouts__title">Checkouts</div>
                        <div className="checkouts__container">
                            <div className="checkouts__list">
                                {report.checkouts.map((checkout, index) => (
                                    <div
                                        key={checkout.id}
                                        className={classnames(
                                            'checkouts__list-item',
                                            {
                                                'checkouts__list-item_active':
                                                    selectedCheckout &&
                                                    checkout.id ===
                                                        selectedCheckout.id
                                            }
                                        )}
                                        onClick={() =>
                                            this.selectCheckout(checkout.id)
                                        }
                                    >
                                        <b>Checkout {index}</b>
                                        <br />
                                        {humanizeDate(checkout.createdAt)}
                                        <br />
                                        {getTotalItemsValue(checkout.items)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {selectedCheckout && (
                    <div className="report-items">
                        <div className="report-items__title">
                            Checkout {selectedCheckoutIndex} -{' '}
                            {Object.keys(selectedCheckout.items).length} items:
                        </div>
                        <div className="report-items__list">
                            {_.map(selectedCheckout.items, item => (
                                <div
                                    key={item.name}
                                    className="report-items__item"
                                >
                                    <img
                                        src={item.originalItem.icon.replace(
                                            /\?.+/,
                                            ''
                                        )}
                                        alt={item.name}
                                        style={{
                                            width: '37px',
                                            height: '37px'
                                        }}
                                    />
                                    {item.name} - {item.cost} - stackSize{' '}
                                    {item.stackSize}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
