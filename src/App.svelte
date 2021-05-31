<script>
  const { ipcRenderer } = require('electron');

  let app = '';
  let error = '';

  const startJob = () => {
    ipcRenderer.send('start-job', { app });
  };

  ipcRenderer.on('error', (e, { message }) => {
    console.error('Error:', message);
    error = message;
  });
</script>

<main>
  <h1>Focus</h1>
  <form on:submit|preventDefault={startJob}>
    <input type="text" bind:value={app} />
    <button type="submit">{app ? `Start ${app}` : 'Enter an app'}</button>
  </form>
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
