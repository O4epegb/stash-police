import * as React from 'react';
import * as ReactDom from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';

import { App } from './App';

import './styles/index.css';

(window as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const container = document.createElement('div');
container.id = 'react-root';
document.body.appendChild(container);

function render(component) {
    ReactDom.render(
        <Provider>
            <HashRouter>
                <Route component={component} />
            </HashRouter>
        </Provider>,
        container
    );
}

render(App);
