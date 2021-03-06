import * as React from 'react';
import posed from 'react-pose';
import * as classnames from 'classnames';

import { Colors } from '../constants';

const InitialText = posed.div({
    noClick: {
        translateX: '0%'
    },
    clickedOnce: {
        translateX: '-100%'
    }
});

const ConfirmationText = posed.div({
    noClick: {
        translateX: '100%'
    },
    clickedOnce: {
        translateX: '0'
    }
});

const Wrapper = posed.div({
    noClick: {
        borderWidth: '2px',
        backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    clickedOnce: {
        borderWidth: '0px',
        backgroundColor: Colors.red
    }
});

interface Props {
    className?: string;
    initialText?: string;
    confirmationText?: string;
    onClick: () => any;
}

interface State {
    isClickedOnce: boolean;
}

export class DeleteButton extends React.Component<Props, State> {
    timeout: NodeJS.Timer;

    constructor(props: Props) {
        super(props);

        this.state = {
            isClickedOnce: false
        };
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    onClick = () => {
        if (this.state.isClickedOnce) {
            this.props.onClick();
        } else {
            this.setState({ isClickedOnce: true });
        }
    };

    onMouseLeave = () => {
        if (this.state.isClickedOnce) {
            this.timeout = setTimeout(() => {
                this.setState({ isClickedOnce: false });
            }, 2000);
        }
    };

    onMouseEnter = () => {
        clearTimeout(this.timeout);
    };

    render() {
        const { initialText, confirmationText, className } = this.props;
        const { isClickedOnce } = this.state;

        return (
            <button
                className={classnames('delete-button', className)}
                onClick={this.onClick}
                onMouseLeave={this.onMouseLeave}
                onMouseEnter={this.onMouseEnter}
            >
                <Wrapper
                    withParent={false}
                    pose={isClickedOnce ? 'clickedOnce' : 'noClick'}
                    className="delete-button__wrapper"
                >
                    <InitialText className="delete-button__text">
                        {this.props.children || initialText || 'Delete'}
                    </InitialText>
                    <ConfirmationText className="delete-button__text">
                        {confirmationText || 'Are you sure?'}
                    </ConfirmationText>
                </Wrapper>
            </button>
        );
    }
}
