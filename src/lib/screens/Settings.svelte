<script>
  import Select from '../components/Select.svelte';
  import Option from '../components/Option.svelte';
  import {globalVolume, microphoneGain, microphoneDevice, microphoneSensitivity, listening, muteHotkey, deafenHotkey, pttHotkey, pttEnabled, muteIndicatorEnabled, muteIndicatorPosition, theme} from '../settings';
import HotkeyBinding from '../components/HotkeyBinding.svelte';
import FFTGraph from '../components/FFTGraph.svelte';

  let microphones = [];
  let speakers = [];

  export let room = null;
  $: localSpeaking = room?.localSpeaking ?? null;
  $: localFFT = room?.localFFT ?? null;

  function refreshDevices() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      microphones = devices.filter(device => device.kind === 'audioinput');
      speakers = devices.filter(device => device.kind === 'audiooutput');
    }).catch(console.error);
  }

  refreshDevices();

</script>

<div class="settings">
  <h1>Settings</h1>
  <div class="settings-scroll">
    <h2>Devices</h2>
    <div class="settings-group">
      <label for="">Output Volume</label>
      <input type="range" min="0" max="5" step="0.01" bind:value={$globalVolume}>
    </div>
    <div class="settings-group">
      <label for="">Input Volume</label>
      <input type="range" min="0" max="5" step="0.01" bind:value={$microphoneGain}>
    </div>
    <div class="settings-group">
      <label for="">Input Device</label>
      <div class="flex row">
        <Select bind:value={$microphoneDevice}>
          <Option value={null}>Default Device</Option>
          {#each microphones as microphone}
            <Option value={microphone.deviceId}>{microphone.label || "Unknown Device"}</Option>
          {/each}
        </Select>
        <button class="borderless" on:click={refreshDevices}><span class="material-symbols-outlined">refresh</span></button>
      </div>
    </div>
    <div class="settings-group">
      <label for="">Input Sensitivity</label>
      <div class="slider">
        <div class="splits">
          <span class="split low" style:width="{($microphoneSensitivity) * 100}%"></span>
          <span class="split high" style:width="{(1-$microphoneSensitivity) * 100}%"></span>
        </div>
        {#if room}
        <div class="indicator" style:width="{$localSpeaking * 100}%"></div>
        <!--  -->
        {/if}
        <input type="range"  min="0" max="1" step="0.01" bind:value={$microphoneSensitivity}>
      </div>
      <FFTGraph fft={$localFFT} />
    </div>
    <div class="settings-group">
      <label for="">Test Microphone</label>
      <div class="flex row start">
        <button on:click={() => listening.update(listening => !listening)}>{$listening ? "Stop" : "Test"}</button>
      </div>
    </div>
    <h2>Keybinds</h2>
    <div class="keybind-group">
      <label for="">Mute</label><HotkeyBinding hotkey="mute" bind:binding={$muteHotkey}/>
      <label for="">Deafen</label><HotkeyBinding hotkey="deafen" bind:binding={$deafenHotkey}/>
      <label for="">PTT</label><HotkeyBinding hotkey="ptt" bind:binding={$pttHotkey}/>
    </div>
    <h2>Options</h2>
    <div class="option-group">
      <label for="">Push-To-Talk Enabled</label>
      <input type="checkbox" bind:checked={$pttEnabled}>
      <label for="">Mute Indicator Enabled</label>
      <input type="checkbox" bind:checked={$muteIndicatorEnabled}>
      <label for="">Mute Indicator Position</label>
      <Select bind:value={$muteIndicatorPosition}>
        {#each ['top', 'middle', 'bottom'] as vert}
        {#each ['left', 'center', 'right'] as horiz}
        <Option value="{vert} {horiz}">{vert.slice(0,1).toUpperCase() + vert.slice(1)} {horiz.slice(0,1).toUpperCase() + horiz.slice(1)}</Option>
        {/each}
        {/each}
      </Select>
      <label for="">Appearance</label>
      <Select bind:value={$theme}>
        <Option value="">System Default</Option>
        <Option value="light">Light</Option>
        <Option value="dark">Dark</Option>
      </Select>
    </div>
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
    margin-bottom: 4rem;
    overflow-y: scroll;
  }
  
  h1 {
    font-size: 1rem;
    border-bottom: 1px solid var(--color-bg-300);
    padding: 1rem;
  }

  h2 {
    font-size: 1rem;
    border-bottom: 1px solid var(--color-bg-200);
    padding: 0.5rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .keybind-group {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-auto-rows: auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .option-group {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-rows: auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .option-group label {
    justify-self: end;
  }

  label {
    font-weight: 400;
  }

  .settings-scroll {
    margin-bottom: 4rem;
    border-bottom: 1px solid var(--color-bg-300);
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 1rem;
    width: 100%;
    max-width: 800px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .slider {
    position: relative;
    width: 100%;
  }

  .slider input[type=range] {
    width: 100%;
  }

  .splits {
    position: absolute;
    top: 0.5rem;
    left: 0;
    width: 100%;
    height: 0.5rem;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow: hidden;
    pointer-events: none;
  }

  .split.low {
    background-color: rgb(180, 151, 76);
  }

  .split.high {
    background-color: rgb(101, 194, 101);
  }

  .slider .indicator {
    height: 0.5rem;
    top: 0.5rem;
    left: 0;
    position: absolute;
    background: rgba(0,0,0,0.3);
    /* border-radius: var(--border-radius); */
  }

  input[type=checkbox] {
    width: 1rem;
    height: 1rem;
    margin: 0.25rem;
    padding: 0;
  }
</style>