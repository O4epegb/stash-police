import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { configure } from 'mobx';
import { observer } from 'mobx-react';

import * as s from './services';
import * as m from './models';
import { isProduction, Routes } from './constants';
import {
    getSettings,
    updateSettings,
    setSessionIdCookie,
    removeSessionIdCookie
} from './utils';
import { Store } from './Store';

import { StartupPage } from './components/StartupPage';
import { LoginPage } from './components/LoginPage';
import { ReportPage } from './components/ReportPage';
import { MainPage } from './components/MainPage';
import { CreateReportPage } from './components/CreateReportPage';
import { Reports } from './components/Reports';
import { Layout } from './components/Layout';
import { UserInfo } from './models';

configure({ enforceActions: true });

// Ensure we start application at main route
window.location.hash = '';

// let globalHistory: RouteComponentProps<any>['history'] = null;

const settings = getSettings();

type Props = RouteComponentProps<any> & {};

interface State {
    tabs: Array<any>;
    currencyByName;
}

@observer
export class App extends React.Component<Props, State> {
    startupTime: number = 0;

    constructor(props: Props) {
        super(props);

        // globalHistory = props.history;

        this.state = {
            tabs: [],
            currencyByName: {}
        };
    }

    componentDidMount() {
        this.init();
    }

    init = () => {
        this.startupTime = Date.now();

        if (!settings.sessionId || !settings.userInfo.accountName) {
            this.goToRoute(Routes.Login);
        } else {
            setSessionIdCookie(settings.sessionId)
                .then(s.getAccountInfo)
                .then(userInfo => {
                    this.onLoginSuccess(userInfo, true);
                })
                .catch(error => {
                    this.goToRoute(Routes.Login);
                });
        }
    };

    goToRoute = (route: Routes, withDelay = true) => {
        const delay =
            isProduction && withDelay
                ? 3000 - (Date.now() - this.startupTime)
                : 0;

        setTimeout(() => {
            this.props.history.push(route);
        }, delay);
    };

    onLoginSuccess = (userInfo: UserInfo, withDelay = false) => {
        Store.setUserInfo(userInfo);
        updateSettings({ userInfo });
        this.goToRoute(Routes.Main, withDelay);
    };

    onLogout = () => {
        removeSessionIdCookie().then(() => {
            this.goToRoute(Routes.Login, false);
        });
    };

    onReportCreated = (report: m.Report) => {
        this.props.history.push(Routes.Report.replace(':id', report.id));
    };

    render() {
        return (
            <div className="content-container">
                <div className="content">
                    <Switch>
                        <Route
                            exact
                            path={Routes.Startup}
                            component={StartupPage}
                        />
                        <Route
                            exact
                            path={Routes.Login}
                            render={props => (
                                <LoginPage
                                    onLoginSuccess={this.onLoginSuccess}
                                />
                            )}
                        />
                        <Layout
                            onLogout={this.onLogout}
                            leftColumn={() => <Route component={Reports} />}
                            rightColumn={() => (
                                <React.Fragment>
                                    <Route
                                        exact
                                        path={Routes.Main}
                                        component={MainPage}
                                    />
                                    <Route
                                        exact
                                        path={Routes.Report}
                                        component={ReportPage}
                                    />
                                    <Route
                                        exact
                                        path={Routes.ReportsCreate}
                                        render={props => (
                                            <CreateReportPage
                                                onReportCreate={
                                                    this.onReportCreated
                                                }
                                            />
                                        )}
                                    />
                                </React.Fragment>
                            )}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
