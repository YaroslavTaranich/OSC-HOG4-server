## Hog OSC Remote

Простое расширяемое приложение для удалённого управления световой консолью **Road Hog (Hog OS ~3.17)** по OSC.

Архитектура:

- **Backend**: Node.js + `osc` + `ws` — WebSocket ↔ OSC мост.
- **Frontend**: React + TypeScript (Vite SPA) — мобильный интерфейс, работающий и на десктопе, и на телефоне/планшете.

---

### Backend

Файлы находятся в директории `backend`.

- Вход: WebSocket-сообщения от клиентов.
- Выход: OSC-сообщения по UDP на консоль Road Hog.

Используемые библиотеки:

- `osc` — отправка OSC по UDP.
- `ws` — WebSocket-сервер.
- `dotenv` — загрузка конфига из `.env`.

#### Конфигурация

Создайте файл `.env` в директории `backend`:

```bash
WS_PORT=8080           # порт WebSocket-сервера
HOG_OSC_HOST=192.168.0.100  # IP Road Hog
HOG_OSC_PORT=6600           # OSC-порт Road Hog
```

Если переменные не заданы, используются значения по умолчанию:

- `WS_PORT`: `8080`
- `HOG_OSC_HOST`: `127.0.0.1`
- `HOG_OSC_PORT`: `6600`

#### Запуск backend

```bash
cd backend
npm install
npm run dev   # или npm start
```

Backend поднимет WebSocket-сервер на `ws://0.0.0.0:8080` и будет слать OSC на `HOG_OSC_HOST:HOG_OSC_PORT`.

Все отправленные OSC-сообщения логируются в консоль.

#### WebSocket-протокол

Фронтенд отправляет на backend JSON-сообщения следующего вида:

- **Нажатие клавиш программатора**

```json
{ "type": "keypress", "key": "INTENSITY" }
```

Мэппинг в OSC:

- адрес: `/hog/keypress/INTENSITY`
- аргументы: нет

- **Энкодеры (относительное изменение)**

```json
{ "type": "encoder", "encoder": 1, "delta": 0.02 }
```

Мэппинг в OSC:

- адрес: `/hog/encoder/1`
- аргументы: `[{ "type": "f", "value": 0.02 }]`

- **Плейбеки**

```json
{ "type": "playback", "playback": 1, "action": "go" }
{ "type": "playback", "playback": 1, "action": "back" }
{ "type": "playback", "playback": 1, "action": "release" }
```

Мэппинг в OSC:

- `go` → `/hog/playback/1/go`
- `back` → `/hog/playback/1/back`
- `release` → `/hog/playback/1/release`

- **Программируемые кнопки (12 штук)**

```json
{ "type": "button", "id": 1 }
```

Мэппинг в OSC (можно донастроить в будущем):

- адрес: `/hog/control/button/1`

---

### Frontend

Файлы находятся в директории `frontend`.

- React + TypeScript + Vite.
- Mobile-first дизайн, крупные кнопки, поддержка touch и desktop.
- Один код → разные layout-ы через CSS (media queries, orientation).

#### Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

По умолчанию Vite поднимет SPA на `http://localhost:5173`.

Фронтенд автоматически коннектится к backend по адресу:

- `ws://<hostname>:8080` (или `wss://` при HTTPS)

Если backend запущен на другом хосте/порте, это можно позже вынести в конфиг.

---

### Экраны и функции

#### 1. Экран Programmer

Компонент: `ProgrammerScreen`.

Содержит:

- **Клавиши программатора** (минимальный набор):
  - `FIXTURE`, `GROUP`, `INTENSITY`, `POSITION`, `COLOUR`, `BEAM`
  - `FULL`, `OUT`, `CLEAR`, `ENTER`, `NEXT`, `LAST`, `FAN`
- **Цифровая клавиатура**:
  - `0–9`, `THRU`
- **Энкодеры**:
  - 4 виртуальных энкодера.
  - Управление:
    - drag вверх/вниз (Pointer Events, touch-friendly)
    - колесо мыши.
  - Отправка сообщений:

    ```json
    { "type": "encoder", "encoder": 1, "delta": 0.02 }
    ```

Все кнопки и keypad-шорткаты отправляют:

```json
{ "type": "keypress", "key": "<KEY>" }
```

#### 2. Экран Playbacks

Компонент: `PlaybacksScreen`.

Функции:

- 10 страниц по 10 плейбеков (1–100).
- Для каждого плейбека (вертикальный стек элементов, кнопки 70x70):
  - `RELEASE`
  - `GO`
  - `BACK`
  - фейдер 70×350 px (0–100%, отправляется как 0..1)
  - `FLASH`
  - Номер PB и процент уровня отображаются сверху (процент под номером).

Отправляемые сообщения:

```json
{ "type": "playback", "playback": 5, "action": "go" }
{ "type": "playback", "playback": 5, "action": "back" }
{ "type": "playback", "playback": 5, "action": "release" }
{ "type": "playback", "playback": 5, "action": "flash" }
{ "type": "playback_fader", "playback": 5, "value": 0.42 }
```

#### 3. Экран Programmable Buttons (Controls)

Компонент: `ButtonsScreen`.

- 12 программируемых кнопок:

```json
{ "type": "button", "id": 1 }
{ "type": "button", "id": 2 }
...
{ "type": "button", "id": 12 }
```

На backend они сейчас мапятся в OSC:

- `/hog/control/button/<ID>`

При необходимости можно привязать к конкретным `controls` Road Hog.

---

### UX / layout

- Mobile-first:
  - крупные кнопки и отступы;
  - отключён zoom (`user-scalable=no`) для более предсказуемого поведения.
- Поддержка touch:
  - `onTouchStart` продублирован для основных кнопок;
  - энкодеры основаны на Pointer Events (работают и с мышью, и с пальцем).
- Горизонтальная ориентация:
  - дополнительные media queries адаптируют layout под landscape на планшетах.

---

### Расширение проекта

Архитектура backend:

- Весь WebSocket → OSC-мэппинг сосредоточен в `src/server.js`:
  - легко добавить новые `type` сообщений;
  - можно расширить мэппинг для конкретных функций Hog (cuelist, masters и т.п.).

Архитектура frontend:

- Отдельный WebSocket-hook: `useHogWebSocket`;
- Экраны вынесены в `src/screens/*`;
- Общие UI-компоненты — в `src/ui/*`.

Это позволяет относительно просто добавлять новые экраны/кнопки/режимы без переписывания ядра.


