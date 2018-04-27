import * as React from 'react';

import { setSessionIdCookie } from '../utils';
import { getAccountInfo } from '../services';
import { UserInfo } from '../models';

interface LoginProps {
    onLoginSuccess: (userInfo: UserInfo) => any;
}

interface LoginState {
    sessionId: string;
    isLoading: boolean;
}

export class LoginPage extends React.Component<LoginProps, LoginState> {
    constructor(props) {
        super(props);

        this.state = {
            sessionId: '',
            isLoading: false
        };
    }

    loginUser = () => {
        const { sessionId } = this.state;
        const { onLoginSuccess } = this.props;

        if (!sessionId) {
            return;
        }

        this.setState({
            isLoading: true
        });

        setSessionIdCookie(this.state.sessionId)
            .then(getAccountInfo)
            .then(userInfo => {
                onLoginSuccess(userInfo);
            })
            .catch(error => {
                this.setState({
                    isLoading: false
                });
                console.log(`login screen: login error ${error}`);
            });
    };

    changeSessionId = (e: React.SyntheticEvent<HTMLInputElement>) => {
        this.setState({
            sessionId: e.currentTarget.value
        });
    };

    render() {
        const { isLoading } = this.state;

        return (
            <div>
                {isLoading ? (
                    <div>Logging in</div>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={this.state.sessionId}
                            onChange={this.changeSessionId}
                        />
                        <button onClick={this.loginUser}>Login</button>
                    </div>
                )}
            </div>
        );
    }
}
