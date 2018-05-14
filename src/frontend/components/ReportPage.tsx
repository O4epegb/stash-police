import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import * as m from '../models';
import { getLeagues, createCheckout } from '../services';
import { formatDate, DateFormats, getTotalItemsValue } from '../utils';
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
            <div>
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
                    <div>
                        <div>Checkouts</div>
                        <div>
                            {report.checkouts.map((checkout, index) => (
                                <div
                                    key={checkout.id}
                                    onClick={() =>
                                        this.selectCheckout(checkout.id)
                                    }
                                >
                                    {selectedCheckout &&
                                        checkout.id === selectedCheckout.id &&
                                        '+'}{' '}
                                    <b>Checkout {index}</b>{' '}
                                    {formatDate(
                                        checkout.createdAt,
                                        DateFormats.DefaultWithTime
                                    )}, total value:{' '}
                                    {getTotalItemsValue(checkout.items)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {selectedCheckout && (
                    <div key={selectedCheckout.id}>
                        Checkout {selectedCheckoutIndex} - items:{' '}
                        {selectedCheckout.items.length}
                        {_.map(selectedCheckout.items, item => (
                            <div key={item.name}>
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
                )}
            </div>
        );
    }
}