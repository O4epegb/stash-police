import * as React from 'react';
import { shell } from 'electron';
import { observer } from 'mobx-react';

import { settingsPath, logsPath } from '../../common';

interface State {
    isOpened: boolean;
}

@observer
export class DevMenu extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {
            isOpened: false
        };
    }

    openFolder = (somePath: string) => {
        shell.showItemInFolder(somePath);
    };

    toggleMenu = () => {
        this.setState({ isOpened: !this.state.isOpened });
    };

    render() {
        const { isOpened } = this.state;

        return (
            <div className="dev-menu" onClick={this.toggleMenu}>
                {isOpened ? (
                    <div>
                        <div onClick={() => this.openFolder(settingsPath)}>
                            Open config folder
                        </div>
                        <div onClick={() => this.openFolder(logsPath)}>
                            Open logs folder
                        </div>
                    </div>
                ) : (
                    <div>Dev menu</div>
                )}
            </div>
        );
    }
}
