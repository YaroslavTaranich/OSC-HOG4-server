## Hog OSC Remote

Простое расширяемое приложение для удалённого управления световой консолью **Road Hog (Hog OS ~3.17)** по OSC.

Архитектура:

- **Backend**: Node.js + `osc` + `ws` — WebSocket ↔ OSC мост.
- **Frontend**: React + TypeScript (Vite SPA) — мобильный интерфейс, работающий и на десктопе, и на телефоне/планшете.

---
## Запуск приложения

Из корня проекта выполнить

```bash
npm start
```

Версия `nodeJs` от `v18.20.4`

На экране настроек нужно ввести IP и Port консоли в HogNet 

### Frontend

Файлы находятся в директории `frontend`.

- React + TypeScript + Vite.
- Mobile-first дизайн, крупные кнопки, поддержка touch и desktop.
- Один код → разные layout-ы через CSS (media queries, orientation).

### Backend

Файлы находятся в директории `backend`.

- Вход: WebSocket-сообщения от клиентов.
- Выход: OSC-сообщения по UDP на консоль Road Hog.

#### WebSocket-протокол

Фронтенд отправляет на backend JSON-сообщения следующего вида:

##### Нажатие клавиш программатора

```json
{ "type": "button_start", "key": "INTENSITY" }
```

Мэппинг в OSC:

- адрес: `/hog/hardware/intensivity`
- аргументы: нет

##### Энкодеры (относительное изменение)

```json
{ "type": "encoder", "encoder": 1, "delta": 0.02 }
```

Мэппинг в OSC:

- адрес: `/hog/hardware/encoderwheel/1`
- аргументы: `[{ "type": "f", "value": 2 }]`

##### Фейдеры

```json
{ "type": "playback_fader", "playback": 1, "value": 100 }
```

Мэппинг в OSC:

- адрес: `/hog/hardware/fader/1`
- аргументы:  `[{ "type": "f", "value": 255 }]`

---

