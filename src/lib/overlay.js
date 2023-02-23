import polka from "polka";
import EventEmitter from "events";
import { createServer } from "http";
import {Server, Socket} from 'socket.io';
import serveStatic from "serve-static";

const OverlayServerState = {
  Stopped: "STOPPED",
  Starting: "STARTING",
  Running: "RUNNING",
  Stopping: "STOPPING",
}

class OverlayServer extends EventEmitter {
  state = OverlayServerState.Stopped;

  /**
   * @type {import("polka").Polka | null}
   */
  polka = null;

  /**
   * @type {import("http").Server | null}
   */
  server = null;

  /**
   * @type {Set<Socket>}
   */
  sockets = new Set();

  start(port) {
    return new Promise((resolve, reject) => {
      if (this.state !== OverlayServerState.Stopped) {reject("Server is not stopped."); return;}
      this.state = OverlayServerState.Starting;
      console.log("Overlay server starting...");
      this.server = createServer();
      this.polka = polka({server: this.server});
      this.io = new Server(this.server, {
        serveClient: true,
      });
      this.io.on('connection', (socket) => {
        this.sockets.add(socket);
        socket.once('close', () => this.sockets.delete(socket));
      })
      // this.io.attach(this.server);
      this.polka.use(serveStatic('./public', {index: 'overlay.html'}));
      this.polka.use((req, res, next) => {res.end()})
      this.polka.listen(port, () => {
        this.state = OverlayServerState.Running;
        console.log("Overlay server started!");
        resolve();
      });
    })
  }

  send_update(state) {
    if (this.state !== OverlayServerState.Running) return;
    this.io.emit('overlay-update', state);
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (this.state == OverlayServerState.Running || this.state == OverlayServerState.Starting) {
        this.state = OverlayServerState.Stopping;
        console.log("Overlay server stopping...");
        // this.server.once('close', );
        this.io.emit('overlay-close');
        this.io.close();
        this.io.disconnectSockets(true);
        this.sockets.forEach(socket => {socket.disconnect(true); socket.client.conn.close(true)});
        this.server.close(() => {
            this.state = OverlayServerState.Stopped
            console.log("Overlay server stopped!");
            resolve();
        });
      } else {reject("Server not running.")}
    })
  }
}

export default OverlayServer;