import React, { Component, Fragment } from 'react'
import { observe, computed, dispose } from 'hyperactiv'

export class Watch extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentWillUnmount() {
        this.__unmounted = true
        if(this.state.render) {
            dispose(this.state.render)
        }
    }
    componentDidMount() {
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
                        !this.__unmounted &&
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
    return observe(obj, { deep: true, batch: true, ...options })
}