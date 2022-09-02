<script>
  import { update_await_block_branch } from "svelte/internal";
import Participant from "../components/Participant.svelte";
  import {muted, deafened, name, muteIndicatorPosition, muteIndicatorEnabled, ptt} from '../settings';
import Settings from "./Settings.svelte";

  export let room;

  let showSettings = false;

  let {participants, localSpeaking} = room;
</script>

<main>
  <div class="connections">
    <h1>Connections</h1>    
    <ul>
      {#each $participants as participant (participant)}
      <li><Participant {participant} /></li>
      {/each}
    </ul>
    <div class="local-controls">
      <span class="cutoff-text">{$name}</span>
      <button class="borderless" class:active={$ptt && !$muted} on:click={() => muted.update((muted) => !muted)}><span class="material-symbols-outlined">{$muted ? "mic_off" : "mic"}</span></button>
      <button class="borderless" on:click={() => deafened.update((deafened) => !deafened)}><span class="material-symbols-outlined">{$deafened ? "headset_off" : "headphones"}</span></button>
      <button class="borderless settings-toggle" on:click={() => showSettings = true}><span class="material-symbols-outlined">settings</span></button>
    </div>
  </div>
  <div class="settings-container" class:show={showSettings}>
    <div class="settings-modal">
      <button class="borderless close-button" on:click={() => showSettings = false}><span class="material-symbols-outlined">close</span></button>
      <Settings {room} />
    </div>
  </div>
</main>
{#if $muted && $muteIndicatorEnabled}
<div class="mute-indicator {$muteIndicatorPosition}"><span class="material-symbols-outlined">mic_off</span></div>
{/if}
<style>
  main {
    display: block;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .connections {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }

  h1 {
    font-size: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-bg-300);
    overflow-y: scroll;
  }

  ul {
    flex-grow: 1;
    padding: 0rem 1rem;
    list-style-type: none;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  li {
    border-bottom: 1px solid var(--color-bg-200);
  }

  .local-controls {
    border-top: 1px solid var(--color-bg-300);
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
  }

  .settings-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: rgba(0,0,0,0.3);
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
  }

  .settings-container.show {
    display: flex;
  }

  .settings-modal {
    position: relative;
    background-color: var(--color-bg-100);
    padding: 0;
    border-radius: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  
  .close-button span {
    font-size: 1rem;
  }

  .mute-indicator {
    position: fixed;
    font-size: 10rem;
    display: flex;
    top: 0;
    left: 0;
    z-index: 10;
    color: var(--color-text-error);
    animation: flash 1s infinite;
    pointer-events: none;
    width: 100%;
    height: 100%;
    padding: 3rem;
  }

  .mute-indicator span {
    font-size: 10rem;
  }

  .mute-indicator:global(.top) {
    align-items: flex-start;
  }
  .mute-indicator:global(.middle) {
    align-items: center;
  }
  .mute-indicator:global(.bottom) {
    align-items: flex-end;
  }

  .mute-indicator:global(.left) {
    justify-content: flex-start;
  }
  .mute-indicator:global(.center) {
    justify-content: center;
  }
  .mute-indicator:global(.right) {
    justify-content: flex-end;
  }

  .active {
    color: var(--color-primary-200);
  }


  @keyframes flash {
    0% {
      opacity: 0%;
    }

    50% {
      opacity: 100%;
    }

    100% {
      opacity: 0%;
    }
  }

  @media (min-width: 800px) {
    main {
      display: grid;
      grid-template-columns: 400px 1fr;

    }

    .connections {
      border-right: 1px solid var(--color-bg-300);
    }

    .settings-toggle {
      display: none;
    }

    .close-button {
      display: none;
    }

    .settings-container {
      display: block;
      background: none;
      position: static;
      padding: 0;
    }

    .settings-container.show {
      display: block;
    }

    .settings-modal {
      position: static;
    }
  }
</style>