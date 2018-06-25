import * as React from 'react';
import * as ReactDom from 'react-dom';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';
import * as electronUnhandled from 'electron-unhandled';

import { logger } from '../common';
import { App } from './App';

import 'react-table/react-table.css';
import './styles/index.css';

(window as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;

electronUnhandled({
    logger: logger.error,
    showDialog: false
});

const container = document.createElement('div');
container.id = 'react-root';
document.body.appendChild(container);

function render(component: React.ComponentType) {
    ReactDom.render(
        <Provider>
            <MemoryRouter>
                <Route component={component} />
            </MemoryRouter>
        </Provider>,
        container
    );
}

render(App);
