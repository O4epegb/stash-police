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
            <React.Fragment key={String(Store.updateFlag)}>
                {format ? formatDate(children, format) : humanizeDate(children)}
            </React.Fragment>
        );
    }
}
