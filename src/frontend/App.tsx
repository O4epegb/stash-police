import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { configure } from 'mobx';
import { observer } from 'mobx-react';

import { Store } from './Store';
import { getAccountInfo } from './services';
import { Report } from './models';
import { isProduction, Routes } from './constants';
import {
    getSettings,
    updateSettings,
    setSessionIdCookie,
    removeSessionIdCookie
} from './utils';

import { StartupPage } from './pages/StartupPage';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import { MainPage } from './pages/MainPage';
import { CreateReportPage } from './pages/CreateReportPage';
import { Reports } from './components/Reports';
import { Layout } from './components/Layout';
import { UserInfo } from './models';

configure({ enforceActions: true });

type Props = RouteComponentProps<any> & {};

interface State {
    tabs: Array<any>;
}

@observer
export class App extends React.Component<Props, State> {
    startupTime: number = 0;
    settings = getSettings();

    constructor(props: Props) {
        super(props);

        this.state = {
            tabs: []
        };
    }

    componentDidMount() {
        this.init();
    }

    init = () => {
        this.startupTime = Date.now();

        if (!this.settings.sessionId || !this.settings.userInfo.accountName) {
            this.goToRoute(Routes.Login);
        } else {
            setSessionIdCookie(this.settings.sessionId)
                .then(getAccountInfo)
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

    onReportCreated = (report: Report) => {
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
                        >
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
                                        onReportCreate={this.onReportCreated}
                                    />
                                )}
                            />
                        </Layout>
                    </Switch>
                </div>
            </div>
        );
    }
}
