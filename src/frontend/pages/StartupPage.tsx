import * as React from 'react';
import { observer } from 'mobx-react';

import { GearLoader } from '../components/GearLoader';
import { Logo } from '../components/Logo';

@observer
export class StartupPage extends React.Component {
    render() {
        return (
            <div className="startup">
                <div className="startup__logo">
                    <Logo />
                </div>
                <h1 className="startup__title">Still alive, Exile?</h1>
                <GearLoader />
            </div>
        );
    }
}
