import io from "socket.io-client";
import { bufferToHex } from "./util";


/**
 * 
 * @param {URL} url 
 * @param {string} steam_id 
 * @param {CryptoKey} key 
 */
export default async function connect(url, steam_id, key) {
  console.log("Connecting socket: ", url, steam_id, key)
  const urlWithParams = new URL(url);
  urlWithParams.searchParams.set('steamid', steam_id);

  const encoder = new TextEncoder();

  const socket = io(urlWithParams.href, {
    autoConnect: false,
    async auth(cb) {
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const payload = {
        padding: bufferToHex(crypto.getRandomValues(new Uint8Array(Math.random() * 32 + 32))),
        timestamp: Date.now(),
        steamId: steam_id.toString()
      };
      const encodedPayload = encoder.encode(JSON.stringify(payload));
      const token = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, encodedPayload));
      cb({
        iv: bufferToHex(iv),
        token: bufferToHex(token)
      })
    }
  })

  return new Promise((resolve, reject) => {
    socket.on('connect_error', (error) => {
      console.error(error);
      reject(new Error("The WebSocket connection failed. Reason: " + error.message))
      socket.close();
    })
    socket.on('connect', () => resolve(socket));

    socket.connect();
  })
}