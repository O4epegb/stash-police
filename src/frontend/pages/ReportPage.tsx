import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import ReactTable from 'react-table';
import * as _ from 'lodash';
import * as classnames from 'classnames';

import * as m from '../models';
import { getLeagues, createCheckout } from '../services';
import { humanizeDate, getTotalItemsValue } from '../utils';
import { Routes } from '../constants';
import { Store } from '../Store';
import { DeleteButton } from '../components/DeleteButton';
import { Value } from '../components/Value';

type Props = RouteComponentProps<{ id: string }> & {};

interface State {
    selectedCheckoutId: string;
    isActiveLeague: boolean;
}

@observer
export class ReportPage extends React.Component<Props, State> {
    checkoutListNode: HTMLDivElement;

    constructor(props: Props) {
        super(props);

        Store.setActiveReport(props.match.params.id);

        console.log('active report', Store.activeReport);

        const report = Store.activeReport;
        const checkouts = report && report.checkouts;

        this.state = {
            selectedCheckoutId: checkouts && _.last(checkouts).id,
            isActiveLeague: false
        };
    }

    componentDidMount() {
        this.checkIfLeagueIsActive();
        this.scrollCheckoutListNode();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            Store.setActiveReport(this.props.match.params.id);

            const report = Store.activeReport;
            const checkouts = report && report.checkouts;

            this.setState(
                {
                    selectedCheckoutId: checkouts && _.last(checkouts).id,
                    isActiveLeague: false
                },
                () => {
                    this.scrollCheckoutListNode();
                }
            );
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

    scrollCheckoutListNode = () => {
        if (this.checkoutListNode) {
            this.checkoutListNode.scrollLeft = this.checkoutListNode.scrollWidth;
        }
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

            this.selectCheckout(checkout.id);
            this.scrollCheckoutListNode();
        });
    };

    deleteReport = () => {
        const { activeReport } = Store;

        this.props.history.push(Routes.Main);
        Store.deleteReport(activeReport);
    };

    deleteCheckout = () => {
        const { activeReport } = Store;
        const { selectedCheckoutId } = this.state;

        const newReport = {
            ...activeReport,
            updatedAt: new Date().toISOString(),
            checkouts: activeReport.checkouts.filter(
                checkout => checkout.id !== selectedCheckoutId
            )
        };

        this.setState({ selectedCheckoutId: null });
        Store.updateReport(newReport);
        Store.setActiveReport(newReport.id);
    };

    handleCheckoutListScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY > 0 ? 1 : -1;
        const currentScroll = this.checkoutListNode.scrollLeft;
        const scrollWidth = Math.max(
            this.checkoutListNode.scrollWidth / 100 * 5,
            50
        );

        this.checkoutListNode.scrollLeft = currentScroll + scrollWidth * delta;
    };

    render() {
        const { selectedCheckoutId, isActiveLeague } = this.state;
        const { match } = this.props;

        const report = Store.activeReport;

        if (!report) {
            return <div>Report with id {match.params.id} is not found</div>;
        }

        const selectedCheckout = report.checkouts.find(
            checkout => checkout.id === selectedCheckoutId
        );
        const selectedCheckoutIndex = report.checkouts.indexOf(
            selectedCheckout
        );

        return (
            <div className="report">
                <h2 className="report__title">
                    Report {report.name}
                    <DeleteButton onClick={this.deleteReport}>
                        Delete
                    </DeleteButton>
                    {isActiveLeague && (
                        <button onClick={this.updateReport}>Update</button>
                    )}
                </h2>
                Created {humanizeDate(report.createdAt)}
                <br />
                Updated {humanizeDate(report.updatedAt)}
                {report.checkouts.length > 0 && (
                    <div className="checkouts__container">
                        <div className="checkouts__title">Checkouts</div>
                        <div
                            className="checkouts__list"
                            onWheel={e => this.handleCheckoutListScroll(e)}
                            ref={node => (this.checkoutListNode = node)}
                        >
                            {report.checkouts.map((checkout, index) => (
                                <React.Fragment key={checkout.id}>
                                    <div
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
                                        <Value
                                            value={getTotalItemsValue(
                                                checkout.items
                                            )}
                                        />
                                    </div>
                                    {index !== report.checkouts.length - 1 && (
                                        <div className="checkouts__list-item-separator" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
                {selectedCheckout && (
                    <div className="report-items">
                        <div className="report-items__title">
                            Checkout {selectedCheckoutIndex}
                            {report.checkouts.length > 1 && (
                                <DeleteButton onClick={this.deleteCheckout}>
                                    Delete
                                </DeleteButton>
                            )}
                            <div>
                                <Value
                                    value={getTotalItemsValue(
                                        selectedCheckout.items
                                    )}
                                />
                            </div>
                            <div>
                                {Object.keys(selectedCheckout.items).length}{' '}
                                items:
                            </div>
                        </div>
                        <ReactTable
                            data={_.map(selectedCheckout.items, item => item)}
                            columns={[
                                {
                                    Header: 'Item',
                                    accessor: 'name',
                                    Cell: ({ original: item }) => (
                                        <div className="report__item-cell">
                                            <img
                                                className="report__item-image"
                                                src={item.originalItem.icon.replace(
                                                    /\?.+/,
                                                    ''
                                                )}
                                                alt={item.name}
                                            />
                                            <div className="report__item-name">
                                                {item.name}
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    Header: 'Cost',
                                    className: 'report__item-cell',
                                    accessor: 'cost',
                                    Cell: row => <Value value={row.value} />
                                },
                                {
                                    Header: 'Stack size',
                                    className: 'report__item-cell',
                                    accessor: 'stackSize',
                                    Cell: row => <Value value={row.value} />
                                }
                            ]}
                            showPagination={false}
                            defaultPageSize={
                                Object.keys(selectedCheckout.items).length
                            }
                            defaultSorted={[
                                {
                                    id: 'cost',
                                    desc: true
                                }
                            ]}
                            style={{
                                flex: '1'
                            }}
                            className="-striped -highlight"
                        />
                    </div>
                )}
            </div>
        );
    }
}
