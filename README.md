# Hog OSC Remote

A simple and extensible application for remote control of a **Road Hog lighting console (Hog OS ~3.17)** via OSC.

The project provides a mobile-friendly web interface that communicates with the console using a **WebSocket ↔ OSC bridge**.

---

## Architecture

* **Backend**: Node.js + `osc` + `ws`
  Acts as a bridge between WebSocket clients and OSC (UDP) messages sent to the console.

* **Frontend**: React + TypeScript (Vite SPA)
  Mobile-first UI that works on desktop, phone, and tablet.

---

## Requirements

* **Node.js** version `>= 18.20.4`
* Network access to the Road Hog console (HogNet)

---

## Installing Node.js

### Option 1: Official Installer (Recommended)

Download Node.js from the official website:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

Choose:

* **LTS version**
* Installer for your OS (Windows / macOS / Linux)

Verify installation:

```bash
node -v
npm -v
```

---

### Option 2: Using NVM (Node Version Manager)

Recommended for developers who manage multiple Node.js versions.

* macOS / Linux:
  [https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)
* Windows:
  [https://github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows)

Example:

```bash
nvm install 18.20.4
nvm use 18.20.4
```

---

## Running the Application

From the project root directory:

```bash
npm start
```

After startup, open the web interface in your browser.

On the **Settings** screen, enter:

* **IP address** of the Road Hog console
* **Port** used by the console in the HogNet network

---

## Frontend

Located in the `frontend` directory.

* React + TypeScript + Vite
* Mobile-first design with large buttons
* Touch and desktop support
* Single codebase with responsive layouts (CSS media queries & orientation)

---

## Backend

Located in the `backend` directory.

* Input: WebSocket messages from frontend clients
* Output: OSC messages via UDP to the Road Hog console

---

## WebSocket Protocol

The frontend sends JSON messages to the backend in the following formats.

### Programmer Button Press

```json
{ "type": "button_start", "key": "INTENSITY" }
```

**OSC mapping:**

* Address: `/hog/hardware/intensivity`
* Arguments: none

---

### Encoders (Relative Change)

```json
{ "type": "encoder", "encoder": 1, "delta": 0.02 }
```

**OSC mapping:**

* Address: `/hog/hardware/encoderwheel/1`
* Arguments:

```json
[{ "type": "f", "value": 2 }]
```

---

### Playback Faders

```json
{ "type": "playback_fader", "playback": 1, "value": 100 }
```

**OSC mapping:**

* Address: `/hog/hardware/fader/1`
* Arguments:

```json
[{ "type": "f", "value": 255 }]
```

---

## Notes

* Designed for **Hog OS ~3.17**
* Intended for use on local networks (HogNet)
* Easily extensible for additional buttons, encoders, and hardware controls

---

## Roadmap (Optional)

* Preset layouts
* Custom button mapping
* User profiles
* OSC feedback from console
* PWA support (offline / home screen install)

---

## License

MIT
