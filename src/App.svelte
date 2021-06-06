<script>
  const { ipcRenderer } = require('electron');
  import TodoList from './TodoList.svelte';

  let app = 'Slack';
  let error = '';
  let initialTodos = [];
  let activeMins = 5;
  let moreTimeMessage = '';
  let frequencyMins = 40;
  // TODO: implement countdown
  let countdown = null;
  let jobRunning = false;

  $: startDisabled =
    !app || !activeMins || !frequencyMins || activeMins > frequencyMins;

  $: error =
    activeMins > frequencyMins
      ? 'Active minutes must be less than minutes between sessions'
      : '';

  const startJob = () => {
    ipcRenderer.send('start-job', { app, activeMins, frequencyMins });
  };

  const stopJob = () => {
    ipcRenderer.send('stop-job', { app });
  };

  const askForMoreTime = () => {
    ipcRenderer.send('more-time', { app });
  };

  ipcRenderer.on('init-todos', (e, data) => {
    console.log(`data:`, data);
    initialTodos = data.todos;
  });

  // TODO: Clean up all these state booleans - maybe a state machine?!
  ipcRenderer.on('start-success', () => {
    jobRunning = true;
    moreTimeMessage = '';
    error = '';
  });

  ipcRenderer.on('stop-success', () => {
    jobRunning = false;
    moreTimeMessage = '';
    error = '';
  });

  ipcRenderer.on('more-time-success', (e, { available }) => {
    error = '';
    moreTimeMessage = available
      ? 'You have five more minutes!'
      : 'You still have time!';

    setTimeout(() => {
      moreTimeMessage = '';
    }, 3000);
  });

  ipcRenderer.on('error', (e, err) => {
    console.error('Error:', err.message || err);
    jobRunning = false;
    moreTimeMessage = '';
    error = err.message || err;
  });
</script>

<main>
  <h1>Focus</h1>
  {#if moreTimeMessage}
    <p>{moreTimeMessage}</p>
  {/if}
  {#if jobRunning}
    <p>
      {app} will open for {activeMins} minutes every {frequencyMins} minutes
    </p>
    <button on:click={stopJob}>Stop job</button>
    <button on:click={askForMoreTime}>Give me more time!</button>
    <TodoList {initialTodos} />
  {:else}
    <form on:submit|preventDefault={startJob}>
      <label>
        App name
        <input type="text" bind:value={app} />
      </label>
      <label>
        Minutes between sessions
        <input type="text" bind:value={frequencyMins} />
      </label>
      <label>
        Active minutes each time
        <input type="text" bind:value={activeMins} />
      </label>
      <button type="submit" disabled={startDisabled}>Start job</button>
    </form>
  {/if}
  {#if error}
    <p class="error">{error}</p>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  .error {
    font-weight: 700;
    color: tomato;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
