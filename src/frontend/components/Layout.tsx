import * as React from 'react';
import { shell } from 'electron';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import posed, { PoseGroup } from 'react-pose';
import { tween } from 'popmotion';

import { settingsPath, Routes, isProduction } from '../constants';
import { Store } from '../Store';

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

const Main = posed.main();

interface Props {
    leftColumn(): React.ReactElement<any>;
    onLogout(): any;
}

@observer
export class Layout extends React.Component<Props> {
    openConfigFolder = () => {
        shell.showItemInFolder(settingsPath);
    };

    render() {
        const { leftColumn, children, onLogout } = this.props;

        return (
            <div className="layout">
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
                                    className="header__account-logout"
                                    onClick={onLogout}
                                >
                                    Logout
                                </div>
                            </div>
                        </div>
                        <div className="header__menu">
                            <Link
                                className="header__menu-item"
                                to={Routes.ReportsCreate}
                            >
                                New Report
                            </Link>
                            {!isProduction && (
                                <div
                                    className="header__menu-item"
                                    onClick={this.openConfigFolder}
                                >
                                    Open config folder
                                </div>
                            )}
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
