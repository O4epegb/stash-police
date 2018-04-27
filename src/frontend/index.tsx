import * as React from 'react';
import * as ReactDom from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';

import { App } from './App';

import './styles/index.css';

const container = document.createElement('div');
container.id = 'react-root';
document.body.appendChild(container);

ReactDom.render(
    <Provider>
        <HashRouter>
            <Route component={App} />
        </HashRouter>
    </Provider>,
    container
);
