import 'dotenv/config';
import osc from 'osc';
import { WebSocketServer } from 'ws';

const WS_PORT = parseInt(process.env.WS_PORT || '8080', 10);
const HOG_OSC_HOST = process.env.HOG_OSC_HOST || '127.0.0.1';
const HOG_OSC_PORT = parseInt(process.env.HOG_OSC_PORT || '6600', 10);

// Simple logger
function log(...args) {
  // Prefix with timestamp
  console.log(new Date().toISOString(), '-', ...args);
}

// Create OSC UDP port for sending messages to Road Hog
const oscPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 0, // random available port, we only send
  remoteAddress: HOG_OSC_HOST,
  remotePort: HOG_OSC_PORT,
  metadata: true
});

oscPort.open();

oscPort.on('ready', () => {
  log(
    `OSC UDP port ready → ${HOG_OSC_HOST}:${HOG_OSC_PORT} (local port ${oscPort.options.localPort})`
  );
});

oscPort.on('error', (err) => {
  console.error('OSC error:', err);
});

// WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

log(`WebSocket server listening on ws://0.0.0.0:${WS_PORT}`);

function sendOscMessage(address, args = []) {
  const msg = {
    address,
    args
  };
  log('OSC →', JSON.stringify(msg));
  oscPort.send(msg);
}

/**
 * Handle a single WebSocket message from client.
 * Expected JSON shape:
 * - { type: "keypress", key: "INTENSITY" }
 * - { type: "encoder", encoder: 1, delta: 0.02 }
 * - { type: "playback", playback: 1, action: "go" | "back" | "release" }
 * - { type: "button", id: number } – programmable buttons, mapped to console controls
 */
function handleClientMessage(ws, rawData) {
  let data;
  try {
    data = JSON.parse(rawData.toString());
  } catch (e) {
    log('Invalid JSON from client:', rawData.toString());
    return;
  }

  const { type } = data || {};
  log('WS ←', data);

  switch (type) {
    case 'keypress': {
      const key = String(data.key || '').toUpperCase();
      if (!key) return;
      const address = `/hog/keypress/${key}`;
      sendOscMessage(address);
      break;
    }
    case 'encoder': {
      const encoder = Number(data.encoder);
      const delta = Number(data.delta);
      if (!Number.isFinite(encoder) || !Number.isFinite(delta)) return;
      const address = `/hog/encoder/${encoder}`;
      sendOscMessage(address, [{ type: 'f', value: delta }]);
      break;
    }
    case 'playback': {
      const playback = Number(data.playback);
      const action = String(data.action || '').toLowerCase();
      if (!Number.isFinite(playback)) return;
      if (!['go', 'back', 'release', 'flash'].includes(action)) return;
      const address = `/hog/playback/${playback}/${action}`;
      sendOscMessage(address);
      break;
    }
    case 'playback_fader': {
      const playback = Number(data.playback);
      const value = Number(data.value);
      if (!Number.isFinite(playback) || !Number.isFinite(value)) return;
      // Expect value in 0..1 range; clamp for safety.
      const clamped = Math.min(1, Math.max(0, value));
      const address = `/hog/playback/${playback}/fader`;
      sendOscMessage(address, [{ type: 'f', value: clamped }]);
      break;
    }
    case 'button': {
      // 12 programmable buttons mapped to some OSC addresses.
      // Here we define a simple mapping that can be adjusted later.
      const id = Number(data.id);
      if (!Number.isFinite(id)) return;

      // Example mapping: /hog/control/button/<ID>
      const address = `/hog/control/button/${id}`;
      sendOscMessage(address);
      break;
    }
    default:
      log('Unknown message type from client:', data);
  }
}

wss.on('connection', (ws, req) => {
  log('Client connected from', req.socket.remoteAddress);

  ws.on('message', (data) => {
    handleClientMessage(ws, data);
  });

  ws.on('close', () => {
    log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  // Optionally send a hello message
  ws.send(JSON.stringify({ type: 'hello', message: 'Connected to Hog OSC bridge' }));
});



