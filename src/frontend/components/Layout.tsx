import * as React from 'react';
import { shell } from 'electron';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { settingsPath, Routes } from '../config';
import { Store } from '../Store';

@observer
export class Layout extends React.Component {
    openConfigFolder = () => {
        shell.showItemInFolder(settingsPath);
    };

    render() {
        return (
            <div className="layout">
                <header className="header">
                    <div className="header__account">
                        <img
                            src={Store.avatarUrl}
                            alt={Store.accountName}
                            className="header__account-avatar"
                        />
                        <div className="header__account-name">
                            {Store.accountName}
                        </div>
                    </div>
                    <div className="header__menu">
                        <Link className="header__menu-item" to={Routes.Reports}>
                            Reports
                        </Link>
                        <Link
                            className="header__menu-item"
                            to={Routes.ReportsCreate}
                        >
                            New Report
                        </Link>
                        <div className="header__menu-item">
                            <button onClick={this.openConfigFolder}>
                                Open config folder
                            </button>
                        </div>
                    </div>
                </header>
                <main className="layout__content">{this.props.children}</main>
            </div>
        );
    }
}
