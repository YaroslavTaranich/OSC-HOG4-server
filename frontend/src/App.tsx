import React, { useMemo } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { HogWebSocketProvider, useHogWebSocket } from './hooks/useHogWebSocket';
import { ProgrammerScreen } from './screens/ProgrammerScreen';
import { PlaybacksScreen } from './screens/PlaybacksScreen';
import { ButtonsScreen } from './screens/ButtonsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const AppLayout: React.FC = () => {
  const { status } = useHogWebSocket();

  const makeTabClassName = ({ isActive }: { isActive: boolean }) =>
    `tab-btn ${isActive ? 'tab-btn--active' : ''}`;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-title">Hog OSC Remote</div>
        <div className={`app-status app-status--${status}`}>{status.toUpperCase()}</div>
      </header>

      <nav className="app-tabs">
        <NavLink to="/programmer" className={makeTabClassName}>
          Programmer
        </NavLink>
        <NavLink to="/playbacks" className={makeTabClassName}>
          Playbacks
        </NavLink>
        <NavLink to="/buttons" className={makeTabClassName}>
          Controls
        </NavLink>
        <NavLink to="/settings" className={makeTabClassName}>
          Settings
        </NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProgrammerScreen />} />
          <Route path="/programmer" element={<ProgrammerScreen />} />
          <Route path="/playbacks" element={<PlaybacksScreen />} />
          <Route path="/buttons" element={<ButtonsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to={'/'} />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'ws://localhost:8080';
    }
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    // WebSocket сервер обычно работает на том же хосте, что и фронт, на порту WS_PORT (по умолчанию 8080)
    return `${protocol}//${loc.hostname}:8080`;
  }, []);

  return (
    <HogWebSocketProvider url={wsUrl}>
      <AppLayout />
    </HogWebSocketProvider>
  );
};


