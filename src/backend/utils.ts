import { BrowserWindow } from 'electron';
import * as _ from 'lodash';

import { getSettings, updateSettings } from '../common';

export function windowStateKeeper() {
    let browserWindow: BrowserWindow;
    let windowState = getSettings().windowState;

    const saveState = _.throttle(
        () => {
            if (!windowState.isMaximized) {
                windowState = {
                    ...browserWindow.getBounds(),
                    isMaximized: false
                };
            }
            windowState.isMaximized = browserWindow.isMaximized();
            updateSettings({
                windowState
            });
        },
        500,
        {
            trailing: true
        }
    );

    return {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
        isMaximized: windowState.isMaximized,
        track(window: BrowserWindow) {
            browserWindow = window;

            ['resize', 'move', 'close'].forEach(event => {
                browserWindow.on(event as any, saveState);
            });
        }
    };
}
