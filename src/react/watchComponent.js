import React from 'react'
import hyperactiv from '../../src/index'
const { computed, dispose } = hyperactiv

export class Watch extends React.Component {
    constructor(props) {
        super(props)
        this._callback = () => {
            this._mounted &&
            this.forceUpdate.bind(this)()
        }
        this.computeRenderMethod(props.render)
    }
    componentWillUnmount() {
        this._mounted = false
        dispose(this._callback)
    }
    componentDidMount() {
        this._mounted = true
    }
    computeRenderMethod(newRender) {
        if(!!newRender && this._currentRender !== newRender) {
            this._currentRender = computed(newRender, {
                autoRun: false,
                callback: this._callback
            })
        }
    }
    render() {
        const { render } = this.props
        this.computeRenderMethod(render)
        return this._currentRender && this._currentRender() || null
    }
}
