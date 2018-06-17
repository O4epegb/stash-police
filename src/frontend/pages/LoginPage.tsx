import * as React from 'react';

import { GearLoader } from '../components/GearLoader';
import { Logo } from '../components/Logo';
import { setSessionIdCookie } from '../utils';
import { getAccountInfo } from '../services';
import { UserInfo } from '../models';

interface LoginProps {
    onLoginSuccess: (userInfo: UserInfo) => any;
}

interface LoginState {
    sessionId: string;
    errorText: string;
    isLoading: boolean;
}

export class LoginPage extends React.Component<LoginProps, LoginState> {
    constructor(props) {
        super(props);

        this.state = {
            sessionId: '',
            errorText: '',
            isLoading: false
        };
    }

    loginUser = () => {
        const { sessionId } = this.state;
        const { onLoginSuccess } = this.props;

        if (!sessionId) {
            this.setState({
                errorText: 'Please, enter SessionId'
            });
            return;
        }

        this.setState({
            errorText: '',
            isLoading: true
        });

        setSessionIdCookie(this.state.sessionId)
            .then(getAccountInfo)
            .then(userInfo => {
                onLoginSuccess(userInfo);
            })
            .catch(error => {
                this.setState({
                    errorText:
                        'Something went wrong. Probably your SessionId is incorrect',
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
        const { isLoading, errorText } = this.state;

        return (
            <div className="login">
                <div className="login__wrapper">
                    <div className="login__logo">
                        <Logo />
                    </div>
                    {isLoading ? (
                        <div className="login__loader">
                            <div className="login__loader-text">Logging in</div>
                            <GearLoader />
                        </div>
                    ) : (
                        <div className="login__form">
                            <input
                                type="text"
                                className="login__form-input"
                                placeholder="POE SessionId"
                                value={this.state.sessionId}
                                onChange={this.changeSessionId}
                            />
                            {errorText && (
                                <div className="login__form-error">
                                    {errorText}
                                </div>
                            )}
                            <button
                                disabled={this.state.sessionId.length === 0}
                                onClick={this.loginUser}
                                className="login__form-button"
                            >
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
