import React, { useMemo, useState } from 'react';
import { HogWebSocketProvider, useHogWebSocket } from './hooks/useHogWebSocket';
import { ProgrammerScreen } from './screens/ProgrammerScreen';
import { PlaybacksScreen } from './screens/PlaybacksScreen';
import { ButtonsScreen } from './screens/ButtonsScreen';

type Screen = 'programmer' | 'playbacks' | 'buttons';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('programmer');

  const wsUrl = useMemo(() => {
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${loc.hostname}:8080`;
  }, []);

  return (
    <HogWebSocketProvider url={wsUrl}>
    <div className="app-root">
      <header className="app-header">
        <div className="app-title">Hog OSC Remote</div>
        <div className={`app-status app-status--${status}`}>{status.toUpperCase()}</div>
      </header>

      <nav className="app-tabs">
        <button
          className={`tab-btn ${screen === 'programmer' ? 'tab-btn--active' : ''}`}
          onClick={() => setScreen('programmer')}
        >
          Programmer
        </button>
        <button
          className={`tab-btn ${screen === 'playbacks' ? 'tab-btn--active' : ''}`}
          onClick={() => setScreen('playbacks')}
        >
          Playbacks
        </button>
        <button
          className={`tab-btn ${screen === 'buttons' ? 'tab-btn--active' : ''}`}
          onClick={() => setScreen('buttons')}
        >
          Controls
        </button>
      </nav>

      <main className="app-main">
        {screen === 'programmer' && <ProgrammerScreen />}
        {screen === 'playbacks' && <PlaybacksScreen />}
        {screen === 'buttons' && <ButtonsScreen />}
      </main>
    </div>
    </HogWebSocketProvider>

  );
};



