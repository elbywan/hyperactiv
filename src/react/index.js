import React, { PureComponent, Fragment } from 'react'
import hyperactiv from 'hyperactiv'

const { observe, computed, dispose } = hyperactiv

export class Watch extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentWillUnmount() {
        this.__mounted = false
        if(this.state.render) {
            dispose(this.state.render)
        }
    }
    componentDidMount() {
        this.__mounted = true
        this.refreshWatcherInState()
    }
    componentDidUpdate(prevProps) {
        if(prevProps.render !== this.props.render) {
            dispose(prevProps.render)
            this.refreshWatcherInState()
        }
    }
    refreshWatcherInState() {
        if(this.props.render) {
            this.setState({
                render: computed(this.props.render, {
                    autoRun: false,
                    callback: () => {
                        this.__mounted &&
                        this.forceUpdate.bind(this)()
                    }
                })
            })
        }
    }
    render() {
        const { render } = this.state
        return React.createElement(
            Fragment,
            [],
            render && render()
        )
    }
}

export const store = function(obj, options = {}) {
    return observe(obj, Object.assign({ deep: true, batch: true }, options))
}