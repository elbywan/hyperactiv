const { observe, computed, dispose } = window.hyperactiv

/* Tools */

// Wraps a component and automatically updates it on change.
const hyperactivComponent = Component => {
    return new Proxy(Component, {
        construct: function(target, argumentsList, constructor) {
            const instance = new target(...argumentsList)
            instance.forceUpdate = instance.forceUpdate.bind(instance)
            return new Proxy(instance, {
                get: function(target, property, receiver) {
                    if(property === 'render') {
                        return computed(target.render.bind(target), { callback: target.forceUpdate })
                    } else if(property === 'componentWillUnmount') {
                        dispose(target.forceUpdate)
                    }
                    return target[property]
                }
            })
        },
    })
}

// A deep observe method.
const observeStore = target => {
    if(target instanceof Array) {
        for(const key in target)
            target[key] = observeStore(target[key])
        return observe(target)
    }
    else if(typeof target === 'object'){
        for(let key in target) {
            if(!target.hasOwnProperty(key))
                continue
            const val = target[key]
            if(typeof val === 'object') {
                target[key] = observeStore(val)
            }
        }
        return observe(target)
    }
}

/* Store */

const store = observeStore({
    todos: [
        { label: 'Do the laundry', completed: false },
        { label: 'Buy shampoo', completed: false },
        { label: 'Create a todo list', completed: true }
    ],
    filterTodos: false,
    newTodoLabel: ''
})

/* Components */

const App = hyperactivComponent(class extends React.Component {
    render() {
        const { total, completed, active } = {
            total: store.todos.length,
            completed: store.todos.filter(_ => _.completed).length,
            active: store.todos.filter(_ => !_.completed).length
        }
        return (
            <div>
                <div className="counters">
                    There are { total } <a href="javascript:void(0)" onClick={ () => store.filterTodos = false } className="highlight">todo(s)</a>.
                    (
                    { completed } <a href="javascript:void(0)" onClick={ () => store.filterTodos = 'completed' } className="highlight">completed</a>,&nbsp;
                    { active } <a href="javascript:void(0)" onClick={ () => store.filterTodos = 'active' } className="highlight">active</a>
                    )
                </div>
                <Todos />
            </div>
        )
    }
})

const Todos = hyperactivComponent(class extends React.PureComponent {
    addTodo = label => {
        label = typeof label === 'string' ? label : 'New todo'
        store.todos = [
            observe({
                label,
                completed: false
            }),
            ...store.todos
        ]
    }

    submitTodo = event => {
        event.preventDefault()
        if(!store.newTodoLabel.trim()) return
        this.addTodo(store.newTodoLabel)
        store.newTodoLabel = ""
    }

    completeAll = () => {
        let completion = store.todos.some(({ completed }) => !completed)
        store.todos.forEach(todo => todo.completed = completion)
    }

    clearCompleted = () => {
        store.todos = store.todos.filter(todo => !todo.completed)
    }

    render() {
        return (
            <React.Fragment>
                <div className="buttons__bar">
                    <button className="button--unstyled" onClick={ this.addTodo }>
                        Add todo
                    </button>
                    <button className="button--unstyled" onClick={ this.completeAll }>
                        Complete all
                    </button>
                    <button className="button--unstyled" onClick={ this.clearCompleted }>
                        Clear completed
                    </button>
                </div>
                <form className="todo__form" onSubmit={ this.submitTodo }>
                    <input type="text"
                        placeholder="What should I do  ..."
                        name="todoname"
                        value={ store.newTodoLabel }
                        onChange={ _ => store.newTodoLabel = _ .target.value }/>
                </form>
                <ul>
                    { store.todos
                        .map((todo, idx) =>
                            store.filterTodos === 'completed' ? (todo.completed && <Todo key={idx} index={idx} />) :
                            store.filterTodos === 'active' ? (!todo.completed && <Todo key={idx} index={idx} />) :
                            <Todo key={idx} index={idx} />)
                    }
                </ul>
            </React.Fragment>
        )
    }
})

const Todo = hyperactivComponent(class extends React.PureComponent {
    removeTodo = () => {
        store.todos = store.todos.filter((_, index) => index !== this.props.index)
    }

    toggleCompletion = () => {
        const todo = store.todos[this.props.index]
        todo.completed = !todo.completed
    }

    render() {
        const todo = store.todos[this.props.index]
        return (
            <div className="todo__bar">
                <input type="text"
                    className={ todo.completed ? 'done' : '' }
                    value={ todo && todo.label }
                    onChange={ event => todo.label = event.target.value }/>
                <button onClick={ this.removeTodo } className="button--unstyled">✖</button>
                <input type="checkbox" checked={todo.completed} onChange={this.toggleCompletion} />
            </div>
        )
    }
})

/* Mounting */

ReactDOM.render(
    <App/>,
    document.getElementById('todos-root')
)