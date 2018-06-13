import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import ReactTable from 'react-table';
import * as _ from 'lodash';
import * as classnames from 'classnames';

import * as m from '../models';
import { getLeagues, createCheckout } from '../services';
import { getTotalItemsValue } from '../utils';
import { Routes } from '../constants';
import { Store } from '../Store';
import { DeleteButton } from '../components/DeleteButton';
import { NumericValue, CurrencyValue } from '../components/Value';
import { DateValue } from '../components/DateValue';

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

    componentWillUnmount() {
        Store.setActiveReport(null);
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

    updateReport = (newReport: m.Report) => {
        Store.updateReport(newReport);
        Store.setActiveReport(newReport.id);
    };

    createNewCheckout = () => {
        const { activeReport } = Store;
        Store.setLayoutLoaderText(`Updating Report`);

        createCheckout({
            accountName: Store.accountName,
            league: activeReport.league,
            tabs: activeReport.lastProccessedTabs,
            updater: ({ totalTabsNumber, tab, processedTabsNumber }) => {
                Store.setLayoutLoaderText(
                    `Fetched tab "${
                        tab.n
                    }" (${processedTabsNumber}/${totalTabsNumber})`
                );
            }
        })
            .then(checkout => {
                console.log('created new checkout', checkout);
                const newReport: m.Report = {
                    ...activeReport,
                    updatedAt: checkout.createdAt,
                    checkouts: [...activeReport.checkouts, checkout]
                };

                this.updateReport(newReport);
                this.selectCheckout(checkout.id);
                this.scrollCheckoutListNode();
            })
            .catch(err => {
                console.log(err);
            })
            .then(() => {
                Store.setLayoutLoaderText();
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
        this.updateReport(newReport);
    };

    handleCheckoutListScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY > 0 ? 1 : -1;
        const currentScroll = this.checkoutListNode.scrollLeft;
        const scrollWidth = Math.max(
            (this.checkoutListNode.scrollWidth / 100) * 5,
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
        const itemsLength =
            selectedCheckout && Object.keys(selectedCheckout.items).length;

        return (
            <div className="report">
                <div className="report__header">
                    <h2 className="report__title">
                        {!report.name.toLowerCase().includes('report') && (
                            <span className="report__title-prefix">
                                Report:{' '}
                            </span>
                        )}
                        <span
                            className="report__title-name"
                            title={report.name}
                        >
                            {report.name}
                        </span>
                    </h2>
                    <div className="report__controls">
                        <button
                            className="report__controls-button"
                            disabled={!isActiveLeague}
                            title={
                                !isActiveLeague ? 'League is not active' : ''
                            }
                            onClick={this.createNewCheckout}
                        >
                            Update
                        </button>
                        <DeleteButton
                            className="report__controls-button"
                            onClick={this.deleteReport}
                        >
                            Delete
                        </DeleteButton>
                    </div>
                </div>
                <div
                    className={classnames('league-name', {
                        'league-name_hc': report.league.isHardcore,
                        'league-name_sc': !report.league.isHardcore
                    })}
                >
                    {report.league.id} League
                </div>
                <div>
                    Created <DateValue>{report.createdAt}</DateValue>
                </div>
                <div>
                    Updated <DateValue>{report.updatedAt}</DateValue>
                </div>
                {report.checkouts.length > 0 && (
                    <div className="checkouts__container">
                        {/* <div className="checkouts__title">Checkouts</div> */}
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
                                        <div className="checkouts__list-item-title">
                                            Checkout {index + 1}
                                        </div>
                                        <div className="checkouts__list-item-date">
                                            <DateValue>
                                                {checkout.createdAt}
                                            </DateValue>
                                        </div>
                                        <div className="checkouts__list-item-value">
                                            <CurrencyValue
                                                value={getTotalItemsValue(
                                                    checkout.items
                                                )}
                                            />
                                        </div>
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
                        <div className="report-items__header">
                            <div className="report-items__title">
                                <div>
                                    <span className="report-items__title-text">
                                        Checkout {selectedCheckoutIndex + 1},{' '}
                                    </span>
                                    <span className="report-items__title-date">
                                        <DateValue>
                                            {selectedCheckout.createdAt}
                                        </DateValue>
                                    </span>
                                </div>
                            </div>
                            {report.checkouts.length > 1 && (
                                <DeleteButton onClick={this.deleteCheckout}>
                                    Delete
                                </DeleteButton>
                            )}
                        </div>
                        <div className="report-items__info-row">
                            <CurrencyValue
                                value={getTotalItemsValue(
                                    selectedCheckout.items
                                )}
                            />
                        </div>
                        <div className="report-items__info-row">
                            {itemsLength} items
                        </div>
                        {itemsLength > 0 && (
                            <ReactTable
                                style={{
                                    flex: '1'
                                }}
                                className="report-items__table -striped -highlight"
                                showPagination={false}
                                defaultPageSize={itemsLength}
                                pageSize={itemsLength}
                                defaultSorted={[
                                    {
                                        id: 'cost',
                                        desc: true
                                    }
                                ]}
                                data={_.map(
                                    selectedCheckout.items,
                                    item => item
                                )}
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
                                        Cell: row => (
                                            <CurrencyValue value={row.value} />
                                        )
                                    },
                                    {
                                        Header: 'Stack size',
                                        className: 'report__item-cell',
                                        accessor: 'stackSize',
                                        Cell: row => (
                                            <NumericValue value={row.value} />
                                        )
                                    }
                                ]}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
}
