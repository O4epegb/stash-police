import * as React from 'react';
import * as classnames from 'classnames';

interface NumericValueProps {
    value: number;
}

export class NumericValue extends React.Component<
    NumericValueProps & React.HTMLProps<HTMLSpanElement>
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

interface CurrencyValueProps {
    value: number;
    name?: string;
}

export class CurrencyValue extends React.Component<
    CurrencyValueProps & React.Props<HTMLSpanElement>
> {
    render() {
        const { name = 'chaos', value, ...restProps } = this.props;

        return (
            <span {...restProps}>
                <NumericValue value={value} /> {name}
            </span>
        );
    }
}
