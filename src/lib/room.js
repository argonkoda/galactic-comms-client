import { derived, get, readable, writable } from "svelte/store";
import connect from './socket';
import * as settings from "./settings";
import io from 'socket.io-client';
import {Room} from "webRTC/client";
import QualityEffectFilterNode from "./audio/QualityEffectFilterNode";
import NoiseGateNode from "./audio/NoiseGateNode";


const salt = "THE SaltIeST oF SaLtIes";

const FFT_SIZE = 64;

export default async function room(user, connection) {

  let participants = new Set();
  const participantsStore = writable(participants);
  const urlString = 'http://' + connection.hostname + ":" + connection.port;
  console.log(urlString);
  const url = new URL(urlString);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  const passwordDK = await crypto.subtle.importKey("raw", encoder.encode(connection.password), { name: "PBKDF2" }, false, ["deriveKey"])

  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 1000, hash: "SHA-256" }, passwordDK, {
    name: "AES-CBC",
    length: 256,
  }, false, ["encrypt", "decrypt"]);

  try {
    const socket = await connect(url, user.steam_id, key);

    const audioCtx = new AudioContext();
    await QualityEffectFilterNode.loadWorklets(audioCtx);
    await NoiseGateNode.loadWorklets(audioCtx);

    const outgoingMediaStreamNode = new MediaStreamAudioDestinationNode(audioCtx, {channelCount: 1, channelCountMode: 'explicit'});
    const destination = new ChannelSplitterNode(audioCtx);
    destination.connect(audioCtx.destination);

    async function transformMessage(data, direction) {
      let result;
      if (direction === "incoming") {
        const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv: data[0] }, key, data[1]);
        const decoded = decoder.decode(decrypted);
        result = JSON.parse(decoded);
        return result;
      } else if (direction === "outgoing") {
        const iv = crypto.getRandomValues(new Uint8Array(16));
        result = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, encoder.encode(JSON.stringify(data)))
        return [iv, result];
      }
    }

    const outputMixer = new GainNode(audioCtx);
    outputMixer.connect(destination);

    const noiseGate = new NoiseGateNode(audioCtx);
    noiseGate.connect(outgoingMediaStreamNode);
    const localFFT = new AnalyserNode(audioCtx, {fftSize: FFT_SIZE * 2});
    localFFT.connect(noiseGate);
    const localMixer = new GainNode(audioCtx);
    localMixer.connect(localFFT);

    const localFFTStore = writable(new Uint8Array(FFT_SIZE));
    
    function updateFFT() {
      for (const participant of participants) {
        participant.fft.update(array => (participant.analyserNode.getByteFrequencyData(array), array));
      }

      localFFTStore.update(array => (localFFT.getByteFrequencyData(array), array));
      
      animationFrame = requestAnimationFrame(updateFFT);
    }
    
    let animationFrame = requestAnimationFrame(updateFFT);


    const globalVolume = derived(
      [
        settings.deafened,
        settings.listening,
        settings.globalVolume
      ],
      ([
        deafened,
        listening,
        volume
      ]) => deafened || listening ? 0 : volume
    );

    const sendingVolume = derived(
      [
        settings.muted,
        settings.ptt,
        settings.pttEnabled,
        settings.listening,
        settings.microphoneGain
      ],
      ([
        muted,
        ptt,
        pttEnabled,
        listening,
        volume
      ]) => (muted || (pttEnabled && !ptt)) && !listening ? 0 : volume
    );
    
    let inputDeviceStreamNode = null;

    const subscriptions = [

      globalVolume.subscribe(volume => outputMixer.gain.value = volume),

      sendingVolume.subscribe(volume => localMixer.gain.value = volume),

      settings.listening.subscribe(listening => {
        noiseGate.disconnect();
        if (listening) {
          noiseGate.connect(destination);
        } else {
          noiseGate.connect(outgoingMediaStreamNode);
        }
      }),

      settings.microphoneSensitivity.subscribe(threshold => noiseGate.parameters.get('threshold').value = threshold),

      settings.microphoneDevice.subscribe(async device => {
        console.log("Getting user audio device.", device)
        if (inputDeviceStreamNode) {
          inputDeviceStreamNode?.disconnect();
        }
        inputDeviceStreamNode = new MediaStreamAudioSourceNode(audioCtx, {mediaStream: await navigator.mediaDevices.getUserMedia({ audio: device ? {deviceId: {exact: device}} : true })});
        inputDeviceStreamNode.connect(localMixer);
    
      })
    ]

    const room = await Room.join(io, url.href, 'main', user, [outgoingMediaStreamNode.stream], transformMessage);

    let resolveRoomClose;

    const roomClosed = new Promise((resolve, reject) => resolveRoomClose = resolve);
    let closed = false;
    function close(reason) {
      if (closed) return;
      closed = true;
      resolveRoomClose(reason);
      room.disconnect();
      socket.close();
      destination.disconnect();
      outputMixer.disconnect();
      cancelAnimationFrame(animationFrame);
      subscriptions.forEach((fn, i) => (console.log(i, fn), fn()));
    }

    socket.on('disconnect', (reason) => {
      const REASON_MAP = {
        "io server disconnect": "The server has closed the connection.",
        "io client disconnect": "Something forced the client to close the connection.",
        "ping timeout": "The connection timed out.",
        "transport close": "The network session was interrupted. This is usually caused by switching networks or disconnecting from the internet.",
        "transport error": "The connection encountered an unexpected error."
      }
      close(REASON_MAP[reason] ?? "An unknown problem was encountered and the connection was terminated.");
    })

    const qualityMap = writable(new Map());

    socket.on('quality-update', (from, quality) => {
      qualityMap.update(map => (map.set(from, quality), map));
    })


    room.on('client-join', client => {
      const analyserNode = new AnalyserNode(audioCtx, {fftSize: FFT_SIZE * 2});
      analyserNode.connect(outputMixer);
      
      const qualityEffectFilterNode = new QualityEffectFilterNode(audioCtx);
      qualityEffectFilterNode.connect(analyserNode);

      const clientMixer = new GainNode(audioCtx);
      clientMixer.connect(qualityEffectFilterNode);

      const tracks = new Set();

      let clientStreamSource = null;
      const fft = writable(new Uint8Array(FFT_SIZE));
      const participant = {
        steam_id: client.clientData.steam_id,
        name: client.clientData.name,
        volume: writable(get(settings.cachedVolumes)[client.clientData.steam_id] ?? 1),
        muted: writable(false),
        quality: derived([qualityMap], ([map]) => map.get(client.clientData.steam_id) ?? 0),
        fft,
        speaking: derived([fft], ([fft]) => fft.reduce((sum, v) => sum + v, 0) > 0),
        analyserNode
      }

      const participantVolume = derived([participant.volume, participant.muted], ([volume, muted]) => muted ? 0 : volume);

      const clientSubscriptions = [
        participant.quality.subscribe(quality => qualityEffectFilterNode.parameters.get('quality').value = quality),
        participantVolume.subscribe(volume => clientMixer.gain.value = volume),
      ]

      function recreateClientStreamSource() {
        if (clientStreamSource) {
          clientStreamSource.disconnect();
        }
        clientStreamSource = new MediaStreamAudioSourceNode(audioCtx, {mediaStream: new MediaStream([...tracks])});
        clientStreamSource.connect(clientMixer);
      }

      client.on('track-added', event => {
        if (event.track.kind === 'audio') {

          //TODO: Check if this audio fix is required.
          const debugAudioElem = document.createElement('audio');
          debugAudioElem.srcObject = new MediaStream();
          debugAudioElem.srcObject.addTrack(event.track);

          tracks.add(event.track);
          recreateClientStreamSource();


          event.streams[0].addEventListener('removetrack', () => {
            tracks.delete(event.track);
            recreateClientStreamSource();
          })
        }
      })

      client.on('client-left', () => {
        analyserNode.disconnect();
        participants.delete(participant);
        participantsStore.set(participants);
        clientSubscriptions.forEach(fn => fn());
      })

      participants.add(participant);
      participantsStore.set(participants);
    })

  
    return {
      participants: derived([participantsStore], ([participants]) => [...participants.values()]),
      localSpeaking: derived([localFFTStore], ([localFFT]) => localFFT.reduce((sum, f) => sum + f, 0) / (255 * FFT_SIZE)),
      localFFT: localFFTStore,
      close() {close(null)},
      closed: roomClosed,
    };
    
  } catch (error) {
    /**
     * @type {Error & {messages?: {connection: Record<string, string>, user: Record<string, string>}}}
     */
    const rethrow = new Error("Failed to connect to server.", {cause: error})
    // TODO: Extract useful information form these errors.
    rethrow.messages = {user: {}, connection: {hostname: "Ensure the hostname is correct.", port: "Ensure the port is correct."}};
    console.error(error);
    throw rethrow;
  }

}