import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import * as _ from 'lodash';

import * as m from '../models';
import { getLeagues, createCheckout } from '../services';
import { formatDate, DateFormats, getTotalItemsValue } from '../utils';
import { Store } from '../Store';

type ReportPageProps = RouteComponentProps<{ id: string }> & {};

@observer
export class ReportPage extends React.Component<
    ReportPageProps,
    {
        selectedCheckoutId: string;
        isActiveLeague: boolean;
    }
> {
    constructor(props: ReportPageProps) {
        super(props);

        Store.setActiveReport(props.match.params.id);

        console.log(Store.activeReport);

        this.state = {
            selectedCheckoutId: null,
            isActiveLeague: false
        };
    }

    componentDidMount() {
        getLeagues().then(leagues => {
            const isActiveLeague = leagues.find(
                league => league.id === Store.activeReport.league.id
            );

            this.setState({
                isActiveLeague: Boolean(isActiveLeague)
            });
        });
    }

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

        return (
            <div>
                {report ? (
                    <div>
                        Report {report.name}
                        <br />
                        {formatDate(
                            report.createdAt,
                            DateFormats.DefaultWithTime
                        )}
                        <br />
                        {isActiveLeague && (
                            <button onClick={this.updateReport}>
                                Update report
                            </button>
                        )}
                        <hr />
                        {report.checkouts.length > 0 && (
                            <div>
                                {report.checkouts.map((checkout, index) => (
                                    <div
                                        key={checkout.id}
                                        onClick={() =>
                                            this.selectCheckout(checkout.id)
                                        }
                                    >
                                        {selectedCheckout &&
                                            checkout.id ===
                                                selectedCheckout.id &&
                                            '+'}{' '}
                                        <b>Checkout {index}</b>{' '}
                                        {formatDate(
                                            checkout.createdAt,
                                            DateFormats.DefaultWithTime
                                        )}, total value:{' '}
                                        {getTotalItemsValue(checkout.items)}
                                    </div>
                                ))}
                                {selectedCheckout && (
                                    <div key={selectedCheckout.id}>
                                        Checkout {selectedCheckoutIndex} -
                                        items: {selectedCheckout.items.length}
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
                                                {item.name} - {item.cost} -
                                                stackSize {item.stackSize}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>Report with id {match.params.id} not found</div>
                )}
            </div>
        );
    }
}
