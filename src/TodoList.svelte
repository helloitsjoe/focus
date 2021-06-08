<script>
  const { ipcRenderer } = require('electron');

  const makeTodo = text => ({
    text,
    done: false,
    id: text,
  });

  export let initialTodos = [];
  let todos = initialTodos;
  let value = '';

  const addTodo = () => {
    todos = [...todos, makeTodo(value)];
    value = '';
    ipcRenderer.send('save-todos', { todos });
  };

  const clearDone = () => {
    todos = todos.filter(({ done }) => !done);
    ipcRenderer.send('save-todos', { todos });
  };

  const handleChecked = id => () => {
    todos = todos.map(todo => {
      if (todo.id === id) return { ...todo, checked: !todo.checked };
      return todo;
    });
  };
</script>

<h2>TODO</h2>
<form on:submit|preventDefault={addTodo}>
  <label for="text">
    <div class="input-group">
      <input type="text" bind:value id="text" />
      <button type="sumbit">Add</button>
      <button type="button" on:click={clearDone}>X</button>
    </div>
  </label>
  <ul>
    {#each todos as todo}
      <li>
        <label class:checked={todo.done}>
          <input
            type="checkbox"
            bind:checked={todo.done}
            on:change={handleChecked(todo.id)}
          />
          {todo.text}
        </label>
      </li>
    {/each}
  </ul>
</form>

<style>
  form {
    margin: auto;
  }

  ul {
    list-style-type: none;
    text-align: left;
    padding: 10px;
  }

  .checked {
    text-decoration: line-through;
  }

  .input-group {
    display: flex;
    justify-content: center;
  }

  .input-group > * {
    display: flex;
    flex: 1;
    justify-content: center;
  }
</style>
