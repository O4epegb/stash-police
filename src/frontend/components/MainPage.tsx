import * as React from 'react';
import { observer } from 'mobx-react';

@observer
export class MainPage extends React.Component {
    render() {
        return <div>Welcome to Stash Police, Exile!</div>;
    }
}
