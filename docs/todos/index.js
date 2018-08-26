/* global React, ReactDOM */
const { PureComponent, Fragment } = React
const { Watch } = window['react-hyperactiv']

/* Store */

const store = window['react-hyperactiv'].store({
    todos: [
        { id: 2, label: 'Do the laundry', completed: false },
        { id: 1, label: 'Buy shampoo', completed: false },
        { id: 0, label: 'Create a todo list', completed: true }
    ]
})

let todoId = 3
const addTodo = label => {
    label = typeof label === 'string' ? label : 'New todo'
    store.todos.unshift({ id: todoId++, label, completed: false })
}

const removeTodo = todo => {
    const index = store.todos.indexOf(todo)
    store.todos.splice(index, 1)
}

const completeAll = () => {
    const completion = store.todos.some(({ completed }) => !completed)
    store.todos.forEach(todo => todo.completed = completion)
}

const clearCompleted = () => {
    store.todos = store.todos.filter(todo => !todo.completed)
}

/* Components */

class App extends PureComponent {

    renderFilter(label, filter = label) {
        return (
            <a href="javascript:void(0)"
                onClick={ () => store.filterTodos = filter }
                className="highlight"
            >
                { label }
            </a>
        )
    }

    watchedRender = () => {
        console.log('(update) App')
        const { total, completed, active } = {
            total: store.todos.length,
            completed: store.todos.filter(_ => _.completed).length,
            active: store.todos.filter(_ => !_.completed).length
        }
        return (
            <div>
                <div className="counters">
                    There is a { this.renderFilter('total', false) } of { total } todo(s).
                    ({ completed } { this.renderFilter('completed') }, { active } { this.renderFilter('active') })
                </div>
                <Todos />
            </div>
        )
    }

    render() {
        return (
            <Watch render={ this.watchedRender } />
        )
    }
}

class NewTodoForm extends PureComponent {

    onNewTodoChange = event => {
        store.newTodoLabel = event.target.value
    }

    submitNewTodo = event => {
        event.preventDefault()
        if(!store.newTodoLabel.trim())
            return
        addTodo(store.newTodoLabel)
        store.newTodoLabel = ''
    }

    watchedRender = () => (
        console.log('(update) NewTodoForm') ||
        <form className="todo__form" onSubmit={ this.submitNewTodo }>
            <input type="text"
                placeholder="What should I do…"
                name="todoname"
                value={ store.newTodoLabel || '' }
                onChange={ this.onNewTodoChange }/>
        </form>
    )

    render() {
        return (
            <Watch render={ this.watchedRender } />
        )
    }
}

class Todos extends PureComponent {

    watchedRender = () => {
        console.log('(update) Todos')

        const todosList = store.todos.reduce((acc, todo) => {
            if(
                !store.filterTodos ||
                store.filterTodos === 'completed' && todo.completed ||
                store.filterTodos === 'active' && !todo.completed
            ) {
                acc.push(<Todo key={todo.id} todo={ todo } />)
            }
            return acc
        }, [])

        return (
            <Fragment>
                <div className="buttons__bar">
                    <button className="button--unstyled" onClick={ addTodo }>
                        Add todo
                    </button>
                    <button className="button--unstyled" onClick={ completeAll }>
                        Toggle completion
                    </button>
                    <button className="button--unstyled" onClick={ clearCompleted }>
                        Clear completed
                    </button>
                </div>
                <NewTodoForm />
                <ul>
                    { todosList.length > 0 ?
                        todosList :
                        <div className="placeholder-text">
                            <span>There are no </span>
                            <span>{store.filterTodos || ''} </span>
                            <span>todos!</span>
                        </div>
                    }
                </ul>
            </Fragment>
        )
    }

    render() {
        return (
            <Watch render={ this.watchedRender } />
        )
    }
}

class Todo extends PureComponent {

    watchedRender = () => {
        const { todo } = this.props
        console.log('(update) Todo ', JSON.stringify(todo))
        return (
            <div className="todo__bar">
                <input type="text"
                    className={ todo.completed ? 'done' : '' }
                    value={ todo.label }
                    onChange={ event => todo.label = event.target.value }/>
                <button onClick={ () => removeTodo(todo) } className="button--unstyled">✖</button>
                <input type="checkbox" checked={todo.completed} onChange={ () => todo.completed = !todo.completed } />
            </div>
        )
    }

    render() {
        return <Watch render={ this.watchedRender } />
    }
}

/* Mounting */

ReactDOM.render(
    <App/>,
    document.getElementById('todos-root')
)