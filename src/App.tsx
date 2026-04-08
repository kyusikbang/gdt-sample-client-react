import { useState, type FormEvent } from "react";
import "./App.css";
import { useHealth } from "./hooks/useHealth";
import { useTodos } from "./hooks/useTodos";
import { apiBaseUrl } from "./lib/api";

function App() {
  const [title, setTitle] = useState("");
  const {
    todosQuery,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
    remainingCount,
    completedCount,
    isBusy,
  } = useTodos();
  const healthQuery = useHealth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    createTodoMutation.mutate(nextTitle);
    setTitle("");
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">GDT sample</p>
        <h1>Todo API demo client</h1>
        <p className="hero-copy">
          Minimal React screen wired to the backend Todo endpoints for quick
          demo and smoke testing.
        </p>

        <div className="status-grid">
          <article className="status-card">
            <span className="status-label">API base URL</span>
            <strong>{apiBaseUrl}</strong>
          </article>
          <article className="status-card">
            <span className="status-label">Health</span>
            <strong>
              {healthQuery.isSuccess ? healthQuery.data.status : "Checking..."}
            </strong>
          </article>
          <article className="status-card">
            <span className="status-label">Open items</span>
            <strong>{remainingCount}</strong>
          </article>
          <article className="status-card">
            <span className="status-label">Completed</span>
            <strong>{completedCount}</strong>
          </article>
        </div>
      </section>

      <section className="board">
        <div className="board-header">
          <div>
            <h2>Todos</h2>
            <p>Create, toggle, and delete records against `/api/todos`.</p>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              void todosQuery.refetch();
              void healthQuery.refetch();
            }}
            disabled={todosQuery.isFetching || healthQuery.isFetching}
          >
            Refresh
          </button>
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="todo-title">
            New todo title
          </label>
          <input
            id="todo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a demo task"
            maxLength={120}
          />
          <button type="submit" disabled={createTodoMutation.isPending}>
            Add todo
          </button>
        </form>

        {createTodoMutation.error ? (
          <p className="feedback error">
            {(createTodoMutation.error as Error).message}
          </p>
        ) : null}

        {todosQuery.isLoading ? <p className="feedback">Loading todos...</p> : null}
        {todosQuery.isError ? (
          <p className="feedback error">
            {(todosQuery.error as Error).message}
          </p>
        ) : null}

        {todosQuery.isSuccess && todosQuery.data.length === 0 ? (
          <div className="empty-state">
            <h3>No todos yet</h3>
            <p>Create one above to verify the API round-trip.</p>
          </div>
        ) : null}

        <ul className="todo-list">
          {todosQuery.data?.map((todo) => (
            <li className="todo-item" key={todo.id}>
              <button
                className={`toggle ${todo.isCompleted ? "done" : ""}`}
                type="button"
                onClick={() => updateTodoMutation.mutate(todo)}
                disabled={isBusy}
                aria-label={
                  todo.isCompleted
                    ? `Mark ${todo.title} as incomplete`
                    : `Mark ${todo.title} as complete`
                }
              >
                {todo.isCompleted ? "Done" : "Open"}
              </button>

              <div className="todo-copy">
                <strong>{todo.title}</strong>
                <span>{todo.id}</span>
              </div>

              <button
                className="danger-button"
                type="button"
                onClick={() => deleteTodoMutation.mutate(todo.id)}
                disabled={isBusy}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
