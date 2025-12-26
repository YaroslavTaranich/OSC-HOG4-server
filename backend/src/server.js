import 'dotenv/config';
import osc from 'osc';
import { WebSocketServer } from 'ws';

const WS_PORT = parseInt(process.env.WS_PORT || '8080', 10);
let HOG_OSC_HOST = process.env.HOG_OSC_HOST || '192.168.1.51';
let HOG_OSC_PORT = parseInt(process.env.HOG_OSC_PORT || '7001', 10);

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
  metadata: false
});

oscPort.open();

oscPort.on('ready', () => {
  log(
    `OSC UDP port ready → ${HOG_OSC_HOST}:${HOG_OSC_PORT} (local port ${oscPort.options.localPort})`
  );
});

oscPort.on('error', (err) => {
  console.error('OSC error:', err);
  // Broadcast OSC error to all connected WebSocket clients
  try {
    const payload = {
      type: 'osc_error',
      message: err?.message || String(err),
      code: err?.code,
      address: HOG_OSC_HOST,
      port: HOG_OSC_PORT
    };
    // wss is defined below; it will be initialized by the time errors can occur
    wss?.clients?.forEach((client) => {
      // 1 === WebSocket.OPEN (avoid direct dependency on WebSocket constant)
      if (client.readyState === 1) {
        try {
          client.send(JSON.stringify(payload));
        } catch (sendErr) {
          console.error('Failed to send OSC error to client:', sendErr);
        }
      }
    });
  } catch (broadcastErr) {
    console.error('Failed to broadcast OSC error:', broadcastErr);
  }
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

    // конфиг OSC (host/port) приходит с фронта
    case 'osc_config': {
      const host = String(data.host || '').trim();
      const port = Number(data.port);

      if (!host || !Number.isFinite(port) || port <= 0 || port > 65535) {
        log('Invalid osc_config from client:', data);
        try {
          ws.send(
            JSON.stringify({
              type: 'osc_config_error',
              message: 'Invalid host or port'
            })
          );
        } catch {}
        break;
      }

      HOG_OSC_HOST = host;
      HOG_OSC_PORT = port;

      // обновляем целевой адрес у уже открытого UDP-порта
      oscPort.options.remoteAddress = host;
      oscPort.options.remotePort = port;

      log(`Updated OSC target → ${host}:${port}`);

      try {
        ws.send(
          JSON.stringify({
            type: 'osc_config_ok',
            host,
            port
          })
        );
      } catch {}

      break;
    }

    // энкодеры
    case 'encoder_start': {
      const encoder = Number(data.encoder);
      if (!Number.isFinite(encoder)) return;
      const address = `/hog/hardware/encoderwheel/${encoder}/z`;

      sendOscMessage(address, [{ type: 'f', value: 1 }]);

      break;
    }
    case 'encoder': {
      const encoder = Number(data.encoder);
      const delta = Number(data.delta);
      if (!Number.isFinite(encoder) || !Number.isFinite(delta)) return;
      const address = `/hog/hardware/encoderwheel/${encoder}`;
      sendOscMessage(address, [{ type: 'f', value: Math.floor(delta * 300) }]);

      break;
    }
    case 'encoder_end': {
      const encoder = Number(data.encoder);
      if (!Number.isFinite(encoder)) return;
      const address = `/hog/hardware/encoderwheel/${encoder}/z`;

      sendOscMessage(address, [{ type: 'f', value: 0 }]);

      break;
    }

    case 'playback_fader': {
      const playback = Number(data.playback);
      const value = Number(data.value)
      if (!Number.isFinite(playback)) return;
      const address = `/hog/hardware/fader/${playback}`;
      sendOscMessage(address, [{ type: 'f', value: Math.floor(255 * value) }]);
      break;
    }

    // программируемые кнопки и цифры
    case 'button_start': {
      const name = String(data.key || '').toLowerCase(); // e.g. 'one', 'two', ..., 'twelve', 'clear', 'go', 'live'
      if (!name) return;

      const baseAddr = `/hog/hardware/${name}`;
      const zAddr = `${baseAddr}/z`;

      sendOscMessage(zAddr, [{ type: 'f', value: 1 }]);
      sendOscMessage(baseAddr, [{ type: 'f', value: 1 }]);

      break;
    }
    case 'button_end': {
      const name = String(data.key || '').toLowerCase(); // e.g. 'one', 'two', ..., 'twelve', 'clear', 'go', 'live'
      if (!name) return;

      const baseAddr = `/hog/hardware/${name}`;
      const zAddr = `${baseAddr}/z`;

        sendOscMessage(baseAddr, [{ type: 'f', value: 0 }]);
        sendOscMessage(zAddr, [{ type: 'f', value: 0 }]);

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



