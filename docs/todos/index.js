/* global React, ReactDOM */
const { Fragment, memo } = React
const { watch, Watch, store: hyperactivStore } = window['react-hyperactiv']

/* Store */

const store = hyperactivStore({
    todos: [
        { id: 2, label: 'Do the laundry', completed: false },
        { id: 1, label: 'Buy shampoo', completed: false },
        { id: 0, label: 'Create a todo list', completed: true }
    ],
    filterTodos: null,
    newTodoLabel: ''
})

const todosActions = {
    idSequence: 3,
    add(label) {
        label = typeof label === 'string' ? label : 'New todo'
        store.todos.unshift({ id: todosActions.idSequence++, label, completed: false })
    },
    remove(todo) {
        const index = store.todos.indexOf(todo)
        store.todos.splice(index, 1)
    },
    completeAll() {
        const completion = store.todos.some(({ completed }) => !completed)
        store.todos.forEach(todo => todo.completed = completion)
    },
    clearCompleted() {
        store.todos = store.todos.filter(todo => !todo.completed)
    }
}

/* Components */

const App = memo(watch(function App() {
    const { total, completed, active } = {
        total: store.todos.length,
        completed: store.todos.filter(_ => _.completed).length,
        active: store.todos.filter(_ => !_.completed).length
    }

    function renderFilter(label, filter = label) {
        return (
            <a href="javascript:void(0)"
                onClick={ () => store.filterTodos = filter }
                className="highlight"
            >
                { label }
            </a>
        )
    }

    return (
        <div>
            <div className="counters">
                There is a { renderFilter('total', false) } of { total } todo(s).
                ({ completed } { renderFilter('completed') }, { active } { renderFilter('active') })
            </div>
            <Todos />
        </div>
    )
}))

const NewTodoForm = memo(watch(function NewTodoForm() {
    function submitNewTodo(event) {
        event.preventDefault()
        if(store.newTodoLabel.trim()) {
            todosActions.add(store.newTodoLabel)
            store.newTodoLabel = ''
        }
    }

    return (
        <form className="todo__form" onSubmit={ submitNewTodo }>
            <input type="text"
                placeholder="What should I do…"
                name="todoname"
                value={ store.newTodoLabel }
                onChange={ event => store.newTodoLabel = event.target.value }/>
        </form>
    )
}))


const Todos = memo(watch(function Todos() {
    const todosList = store.todos.reduce((acc, todo) => {
        if(
            !store.filterTodos ||
            store.filterTodos === 'completed' && todo.completed ||
            store.filterTodos === 'active' && !todo.completed
        ) {
            acc.push(<Todo key={todo.id} todo={todo} />)
        }
        return acc
    }, [])

    return (
        <Fragment>
            <div className="buttons__bar">
                <button className="button--unstyled" onClick={ todosActions.add }>
                    Add todo
                </button>
                <button className="button--unstyled" onClick={ todosActions.completeAll }>
                    Toggle completion
                </button>
                <button className="button--unstyled" onClick={ todosActions.clearCompleted }>
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
}))

const Todo = memo(function Todo({ todo }) {
    return (
        <Watch render={() =>
            <div className="todo__bar">
                <input type="text"
                    className={ todo.completed ? 'done' : '' }
                    value={ todo.label }
                    onChange={ event => todo.label = event.target.value }/>
                <button
                    onClick={ () => todosActions.remove(todo) }
                    className="button--unstyled"
                >✖</button>
                <input
                    type="checkbox"
                    checked={ todo.completed }
                    onChange={ () => todo.completed = !todo.completed }
                />
            </div>
        }/>
    )
})

/* Mounting */

ReactDOM.render(
    <App/>,
    document.getElementById('todos-root')
)