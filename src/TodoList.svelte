<script>
  const makeTodo = text => ({
    text,
    done: false,
    id: text,
  });

  let todos = [];
  let value = '';

  const addTodo = () => {
    todos = [...todos, makeTodo(value)];
    value = '';
  };

  const clearDone = () => {
    todos = [...todos.filter(({ done }) => !done)];
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
  ul {
    list-style-type: none;
    text-align: left;
  }

  .checked {
    text-decoration: line-through;
  }

  .input-group {
    display: flex;
  }
</style>
