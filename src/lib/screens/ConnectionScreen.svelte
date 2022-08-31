<script>
import ConfirmAction from '../components/ConfirmAction.svelte';

import Field from '../components/Field.svelte';

  import {steamId, name, knownServers} from '../settings';

  export let room;

  let errors = {connection: {}, user: {}};

  let connection, selectedServer;

  function selectServer(id) {
    selectedServer = id;
    connection = JSON.parse(JSON.stringify($knownServers[id] ?? {
      name: "", hostname: "", port: "", password: ""
    }));
  }

  function validateServer(connection, requireName = false) {
    errors.connection = {};
    // Server Name
    if (requireName && (!connection.name || connection.name.trim().length <= 0)) errors.connection.server_name = "You need a name to save the server.";

    // Hostname
    if (!connection.hostname || connection.hostname.length <= 0) {errors.connection.hostname = "The hostname is required."}
    else {
      let url = null;
      try {
        url = new URL("http://" + connection.hostname).hostname;
      } catch (error) {
        url = "";
      }
      if (url !== connection.hostname) errors.connection.hostname = "The hostname is invalid. Make sure it's formatted correctly.";
    }

    //Port
    if (!connection.port || connection.port.length <= 0) {errors.connection.port = "The server port is required."}
    else if(!connection.port.match(/^[0-9]{4,6}$/)) {errors.connection.port = "The server port should be 4-6 digits."}

    //Password
    if (!connection.password || connection.password.length <= 0) {errors.connection.password = "The server password is required."}

    return (Object.keys(errors.connection).length <= 0);
  }

  function saveServer() {
    
    if (!validateServer(connection, true)) return false;

    if (selectedServer === null) selectedServer = crypto.randomUUID();
    $knownServers[selectedServer] = JSON.parse(JSON.stringify(connection));
    selectServer(selectedServer);
    return true;
  }

  function deleteServer(id) {
    console.log("Deleting Server: " + id)
    let temp = $knownServers;
    delete temp[id];
    $knownServers = temp;
    if (id === selectedServer) selectedServer = null;
  }

  function validateUser(user) {
    errors.user = {};
    if (!user.name || user.name.length <= 0) {errors.user.name = "Your name is required.";}
    else if (user.name.trim().length !== user.name.length) errors.user.name = "Your name can't begin or end with whitespace (spaces or tabs).";
    if (!user.steam_id || user.steam_id.length <= 0) {errors.user.steam_id = "Your Steam ID is required.";}
    else if (!user.steam_id.match(/^[0-9]+$/)) {errors.user.steam_id = "A Steam ID only consists of numbers. Make sure you have copied the right ID."}

    return Object.keys(errors.user).length <= 0;
  }

  let connecting = false;

  async function connect() {
    let valid = true;
    if (!selectedServer && connection.name) {
      console.log("Validating through save");
      valid = saveServer() && valid;
    } else {
      console.log("Validating through check");
      valid = validateServer(connection) && valid;
    }

    valid = validateUser({name: $name, steam_id: $steamId}) && valid;

    if (valid) {
      console.log("VALID!");
    } else {
      throw new Error("Failed to validate connection details.")
    }
  }

  function handleSubmit() {
    connecting = true;
    connect().finally(() => connecting = false);
  }

  selectServer(null);


</script>

<main>
  <form class="connection-screen" class:hidden={connecting} on:submit|preventDefault={handleSubmit}>
    <p class="section-title">Servers</p><p class="section-title">Connection</p>
    <ul class="known-servers">
      {#each Object.entries($knownServers) as [id, {name}] (id)}
        <li class="known-server" class:selected={selectedServer===id} on:click={() => selectServer(id)}>
          <span class="known-server-name">{name}</span>
          <ConfirmAction type="button" class="borderless" on:confirm={() => deleteServer(id)}><span class="material-symbols-outlined known-server-delete">delete</span></ConfirmAction>
        </li>
      {/each}
    </ul>
    <div class="connection-form">
      <Field error={errors.connection.server_name} icon="bookmark" type="text" bind:value={connection.name} placeholder="Server Name">
        <p class="flex row start"><strong>Optional</strong> If you specify this we'll save the server details under this name for later use.</p>
      </Field>
      <Field error={errors.connection.hostname} icon="dns" type="text" bind:value={connection.hostname} placeholder="Hostname">
        <p class="flex row start"><strong>Required</strong> The IP of the server to connect to. Port is specified later.</p>
      </Field>
      <Field error={errors.connection.port} icon="electrical_services" type="text" bind:value={connection.port} placeholder="Port">
        <p class="flex row start"><strong>Required</strong> The port of the server to connect to. A 4-6 digit number</p>
      </Field>
      <Field error={errors.connection.password} icon="lock" type="password" bind:value={connection.password} placeholder="Password">
        <p class="flex row start"><strong>Required</strong> The password for the server.</p>
      </Field>
      <div class="flex row end">
        {#if selectedServer !== null}<button type="button" on:click={saveServer}>Save</button>{/if}
        <button type="button" on:click={() => {selectedServer = null; saveServer();}}>Add</button>
      </div>
    </div>
    <div class="user-row">
      <Field error={errors.user.name} icon="person" type="text" bind:value={$name} placeholder="Name">
        <p class="flex row start"><strong>Required</strong> This is the name others will see when you connect.</p>
      </Field>
      <Field error={errors.user.steam_id} icon="badge" type="text" bind:value={$steamId} placeholder="Steam ID">
        <div class="flex row start"><strong>Required</strong><p>This is your Steam ID. You can get this from your Steam <em>Account Details</em> page.</p></div>
      </Field>
      <button class="primary" type="submit">Connect</button>
    </div>
    {#if connecting}
    <div class="spinner"></div>
    {/if}
  </form>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .user-row {
    border-top: 1px solid var(--color-bg-300);
    padding: 1rem;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.5rem;
  }

  .known-servers {
    border-right: 1px solid var(--color-bg-300);
    overflow-y: scroll;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    max-height: 100%;
  }

  .known-server {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 1rem;
    border-bottom: 1px solid var(--color-bg-300);
  }

  .known-server:hover {
    background: var(--color-bg-300);
  }

  .known-server.selected {
    background: var(--color-primary-200);
  }

  .known-server.selected:hover {
    background: var(--color-primary-100);
  }

  .known-server-name {
    flex-grow: 1;
  }

  .known-server-delete {
    visibility: hidden;
    color: var(--color-text-disabled);
  }

  .known-server-delete:hover {
    color: var(--color-text-error);
  }

  .known-server:hover .known-server-delete {
    visibility: inherit;
  }

  .section-title {
    padding: 1rem 1rem 0.5rem 1rem;
    border-bottom: 1px solid var(--color-bg-300);
  }

  .connection-screen {
    position: relative;
    background-color: var(--color-bg-200);
    display: grid;
    grid-template-columns: 15rem 30rem;
    grid-template-rows: auto 17rem auto;
    border-radius: 1rem;
  }

  .connection-screen.hidden > *:not(.spinner) {
    visibility: hidden;
  }

  .connection-form {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 1rem;
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4rem;
    height: 4rem;
    border-top: 2px solid var(--color-bg-400);
    /* border-bottom: transparent;
    border-right: transparent; */
    border-radius: 100vh;
    animation: spin 1s infinite linear;
  }
</style>

