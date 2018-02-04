/* global React, ReactDOM */
const { Fragment } = React
const { observe, computed, dispose } = window.hyperactiv

/* Tools */

// Wraps a component and automatically updates it when the store mutates.
const watch = Component => new Proxy(Component, {
    construct: function(target, argumentsList) {
        // Create a new Component instance
        const instance = new target(...argumentsList)
        // Ensures that the forceUpdate in correctly bound
        instance.forceUpdate = instance.forceUpdate.bind(instance)
        // Monkey patch the componentWillUnmount method to do some clean up on destruction
        const originalUnmount =
            typeof instance.componentWillUnmount === 'function' &&
            instance.componentWillUnmount.bind(instance)()
        instance.componentWillUnmount = function(...args) {
            dispose(instance.forceUpdate)
            if(originalUnmount)
                originalUnmount(...args)
        }
        // Return a proxified Component
        return new Proxy(instance, {
            get: function(target, property) {
                if(property === 'render') {
                    // Compute the render function and forceUpdate on changes
                    return computed(target.render.bind(target), { callback: instance.forceUpdate })
                }
                return target[property]
            }
        })
    }
})

/* Store */

const store = observe({
    todos: [
        { id: 2, label: 'Do the laundry', completed: false },
        { id: 1, label: 'Buy shampoo', completed: false },
        { id: 0, label: 'Create a todo list', completed: true }
    ]
}, { deep: true })

let todoId = 3
const addTodo = label => {
    label = typeof label === 'string' ? label : 'New todo'
    store.todos = [
        observe({ id: todoId++, label, completed: false }),
        ...store.todos
    ]
}

const removeTodo = todo => {
    store.todos = store.todos.filter(_ => _ !== todo)
}

const completeAll = () => {
    const completion = store.todos.some(({ completed }) => !completed)
    store.todos.forEach(todo => todo.completed = completion)
}

const clearCompleted = () => {
    store.todos = store.todos.filter(todo => !todo.completed)
}

/* Components */

const App = watch(class extends React.Component {
    render() {
        const { total, completed, active } = {
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
                    { active } <a href="javascript:void(0)" onClick={ () => store.filterTodos = 'active' } className="highlight">active</a>
                    )
                </div>
                <Todos />
            </div>
        )
    }
})

const Todos = watch(class extends React.PureComponent {

    submitTodo = event => {
        event.preventDefault()
        if(!store.newTodoLabel.trim()) return
        addTodo(store.newTodoLabel)
        store.newTodoLabel = ''
    }

    render() {
        return (
            <Fragment>
                <div className="buttons__bar">
                    <button className="button--unstyled" onClick={ addTodo }>
                        Add todo
                    </button>
                    <button className="button--unstyled" onClick={ completeAll }>
                        Complete all
                    </button>
                    <button className="button--unstyled" onClick={ clearCompleted }>
                        Clear completed
                    </button>
                </div>
                <form className="todo__form" onSubmit={ this.submitTodo }>
                    <input type="text"
                        placeholder="What should I do  ..."
                        name="todoname"
                        value={ store.newTodoLabel || '' }
                        onChange={ _ => store.newTodoLabel = _.target.value }/>
                </form>
                <ul>
                    { store.todos.map(todo =>
                        store.filterTodos === 'completed' ? todo.completed && <Todo key={todo.id} todo={todo} /> :
                        store.filterTodos === 'active' ? !todo.completed && <Todo key={todo.id} todo={todo} /> :
                        <Todo key={todo.id} todo={todo} />)
                    }
                </ul>
            </Fragment>
        )
    }
})

const Todo = watch(class extends React.PureComponent {

    toggleCompletion = () => {
        const { todo } = this.props
        todo.completed = !todo.completed
    }

    render() {
        const { todo } = this.props
        return (
            <div className="todo__bar">
                <input type="text"
                    className={ todo.completed ? 'done' : '' }
                    value={ todo && todo.label }
                    onChange={ event => todo.label = event.target.value }/>
                <button onClick={ () => removeTodo(todo) } className="button--unstyled">✖</button>
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