import {APP_ID as appId, CLI_BASE_URL} from './apptile.config';
const exponentialBackoffs = [500, 1000, 2000, 3000, 5000, 10000, 10000];
type Callback = (...args: any[]) => void;

let ws: WebSocket|null = null;  
const callbacks: Set<Callback> = new Set();
const PLUGIN_SOCKET_URL = `ws://${CLI_BASE_URL}/healthcheck`;

function sendLog(message: string) {
  if (ws) {
    try {
      ws.send(JSON.stringify({type: "mobileLog", message }));
    } catch (err) {
      console.error("Error in sending log: ", err);
    }
  } else {
    console.info("Couldn't send log as no ws exists");
  }
}

global.sendLog = sendLog;

function establishConnection(withDelay: boolean) {
  let nextBackoffIndex = 0;
  let connectionInProgress = false;
  let timeout: null|ReturnType<typeof setTimeout> = null;

  if (withDelay) {
    if (timeout === null) {
      const delay = exponentialBackoffs[nextBackoffIndex];
      nextBackoffIndex = (nextBackoffIndex + 1) % exponentialBackoffs.length;
      console.log("Queueing connection request with delay: ", delay);
      timeout = setTimeout(() => {
        timeout = null;
        establishConnection(false);
      }, delay);
    } else {
      console.log("Not queuing connection request as one is already queued");
    }
  } else {
    if (!connectionInProgress) {
      ws = new WebSocket(PLUGIN_SOCKET_URL);
      connectionInProgress = true;
      ws = ws as WebSocket;
      ws.onerror = (err: any) => {
        connectionInProgress = false;
        console.error("Socket error", err);
        if (ws) {
          ws.close();
        }
      };

      ws.onopen = () => {
        connectionInProgress = false;
        console.log("Socket is open");
        if (ws) {
          ws.send(`{"type": "register", "kind": "phone", "appId": "${appId}"}`)
        }
      }

      ws.onmessage = (event) => {
        let msg: any;
        if (typeof event.data === "string") {
          msg = JSON.parse(event.data.toString());
        } else {
          const buffer = new Uint8Array(event.data);
          let message = "";
          for (let i = 0; i < buffer.length; ++i) {
            message += String.fromCharCode(buffer[i]);
          }
          console.log(message);
          msg = JSON.parse(message);
        }
        for (let cb of callbacks) {
          cb(msg);
        }
      }

      ws.onclose = () => {
        console.log("Socket was closed! will retry");
        establishConnection(true);
      }
    } else {
      console.log("Ignoring connection request as one is already in progress");
    }
  }
}

establishConnection(false);

export function registerCallback(fcn: (...args: any[]) => void) {
  if (!callbacks.has(fcn)) {
    callbacks.add(fcn);  
  }
  return () => callbacks.delete(fcn);
};

