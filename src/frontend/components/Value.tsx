import * as React from 'react';
import * as classnames from 'classnames';

interface Props {
    value: number;
}

export class Value extends React.Component<
    Props & React.HTMLProps<HTMLSpanElement>
> {
    render() {
        const { value, className, ...restProps } = this.props;

        return (
            <span
                {...restProps}
                className={classnames('numeric-value', className)}
            >
                {Number(value.toFixed(1))}
            </span>
        );
    }
}
