import { PureComponent } from 'react'
import hyperactiv from 'hyperactiv'

const { observe, computed, dispose } = hyperactiv

export class Watch extends PureComponent {
    constructor(props) {
        super(props)
        this._callback = () => {
            this.__mounted &&
            this.forceUpdate.bind(this)()
        }
        this.state = {
            render: this.computeRenderMethod(props.render)
        }
    }
    componentWillUnmount() {
        this.__mounted = false
        if(this.state.render) {
            dispose(this.state.render)
            dispose(this._callback)
        }
    }
    componentDidMount() {
        this.__mounted = true
    }
    computeRenderMethod(newRender) {
        if(this._currentRender !== newRender) {
            if(!newRender)
                return null
            this._currentRender = computed(newRender, {
                autoRun: false,
                callback: this._callback
            })
        }
        return this._currentRender
    }
    render() {
        const { render } = this.props
        this.computeRenderMethod(render)
        return this._currentRender && this._currentRender() || null
    }
}

export const store = function(obj, options = {}) {
    return observe(obj, Object.assign({ deep: true, batch: true }, options))
}