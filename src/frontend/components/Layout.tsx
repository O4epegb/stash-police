import * as React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import posed, { PoseGroup } from 'react-pose';
import { tween } from 'popmotion';

import { Routes, isProduction } from '../constants';
import { Store } from '../Store';
import { DevMenu } from './DevMenu';
import { GearLoader } from './GearLoader';
import { Logo } from './Logo';

const Column = posed.div({
    enter: {
        translateX: '0%',
        opacity: 1,
        transition: props => tween({ ...props, duration: 200 })
    },
    exit: {
        translateX: ({ i }) => (i % 2 === 0 ? '-100%' : '100%'),
        opacity: 0,
        transition: props => tween({ ...props, duration: 200 })
    }
});

const Header = posed.header({
    enter: {
        translateY: '0%',
        opacity: 1,
        transition: props => tween({ ...props, duration: 200 })
    },
    exit: {
        translateY: '-100%',
        opacity: 0,
        transition: props => tween({ ...props, duration: 200 })
    }
});

const Loader = posed.div({
    enter: {
        opacity: 1
    },
    exit: {
        opacity: 0
    }
});

const Main = posed.div();

interface Props {
    leftColumn(): React.ReactElement<any>;
    onLogout(): any;
}

@observer
export class Layout extends React.Component<Props> {
    render() {
        const { leftColumn, children, onLogout } = this.props;

        return (
            <div className="layout">
                <PoseGroup animateOnMount singleChildOnly>
                    {Store.layourLoaderText && [
                        <Loader className="layout__loader" key="loader">
                            <div className="layout__loader-text">
                                {Store.layourLoaderText}
                            </div>
                            <GearLoader />
                        </Loader>
                    ]}
                </PoseGroup>
                <PoseGroup animateOnMount>
                    <Header className="header" key="header">
                        <div className="header__account">
                            <img
                                src={Store.avatarUrl}
                                alt={Store.accountName}
                                className="header__account-avatar"
                            />
                            <div className="header__account-content">
                                <div className="header__account-name">
                                    {Store.accountName}
                                </div>
                                <div
                                    className="header__account-logout pseudo-link"
                                    onClick={onLogout}
                                >
                                    Logout
                                </div>
                            </div>
                            {Store.updateText && (
                                <div className="update-info">
                                    <div className="update-info__text">
                                        {Store.updateText}
                                    </div>
                                    {Store.updateButtonText && (
                                        <button
                                            className="update-info__button"
                                            onClick={Store.onUpdateButtonClick}
                                        >
                                            {Store.updateButtonText}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <Link className="header__logo" to={Routes.Main}>
                            <Logo />
                        </Link>
                        <div className="header__menu">
                            <NavLink
                                activeClassName="header__menu-item_active"
                                className="header__menu-item"
                                to={Routes.ReportsCreate}
                            >
                                Create new Report
                            </NavLink>
                            {!isProduction && <DevMenu />}
                        </div>
                    </Header>
                    <Main className="layout__content" key="layout__content">
                        <Column
                            className="layout__column"
                            key="left-column"
                            i={0}
                        >
                            {leftColumn()}
                        </Column>
                        <Column
                            className="layout__column"
                            key="right-column"
                            i={1}
                        >
                            {children}
                        </Column>
                    </Main>
                </PoseGroup>
            </div>
        );
    }
}
