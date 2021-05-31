<script>
  const { ipcRenderer } = require('electron');

  let app = '';
  let error = '';
  let activeMins = 5;
  let frequencyMins = 60;
  let jobRunning = false;

  const startJob = () => {
    ipcRenderer.send('start-job', { app, activeMins, frequencyMins });
  };

  const stopJob = () => {
    ipcRenderer.send('stop-job', { app });
  };

  ipcRenderer.on('start-success', () => {
    jobRunning = true;
    error = '';
  });

  ipcRenderer.on('stop-success', () => {
    jobRunning = false;
    error = '';
  });

  ipcRenderer.on('error', (e, err) => {
    console.error('Error:', err.message || err);
    jobRunning = false;
    error = err.message || err;
  });
</script>

<main>
  <h1>Focus</h1>
  {#if jobRunning}
    <p>
      {app} will open for {activeMins} minutes every {frequencyMins} minutes
    </p>
    <button on:click={stopJob}>Stop job</button>
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
      <button type="submit" disabled={!(app && activeMins && frequencyMins)}
        >Start job</button
      >
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
