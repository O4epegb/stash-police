import * as React from 'react';
import { observer } from 'mobx-react';

@observer
export class StartupPage extends React.Component {
    render() {
        return (
            <div className="startup">
                <h1 className="startup__title">
                    Welcome to Stash Police, Exile!
                </h1>
            </div>
        );
    }
}
