import * as React from 'react';
import { observer } from 'mobx-react';

import { humanizeDate, formatDate, DateFormats } from '../utils';
import { Store } from '../Store';

interface Props {
    format?: DateFormats;
    children: string;
}

@observer
export class DateValue extends React.Component<Props> {
    render() {
        const { children, format } = this.props;

        return (
            <span
                key={String(Store.updateFlag)}
                title={formatDate(children, DateFormats.DefaultWithTime)}
            >
                {format ? formatDate(children, format) : humanizeDate(children)}
            </span>
        );
    }
}
