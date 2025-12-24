import React, { useMemo } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import classNames from 'classnames';
import { HogWebSocketProvider, useHogWebSocket } from './hooks/useHogWebSocket';
import { ProgrammerScreen } from './screens/ProgrammerScreen';
import { PlaybacksScreen } from './screens/PlaybacksScreen';
import { ButtonsScreen } from './screens/ButtonsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import styles from './App.module.css';

const AppLayout: React.FC = () => {
  const { status, oscError } = useHogWebSocket();

  const makeTabClassName = ({ isActive }: { isActive: boolean }) =>
    classNames(styles.tabBtn, {
      [styles.tabBtnActive]: isActive
    });

  const statusClassMap: Record<string, string> = {
    connecting: styles.appStatusConnecting,
    open: styles.appStatusOpen,
    closed: styles.appStatusClosed
  };

  const headerStatusLabel = oscError ? 'OSC CONNECTION ERROR' : status.toUpperCase();
  const headerStatusClass = oscError ? styles.appStatusError : statusClassMap[status];

  return (
    <div className={styles.appRoot}>
      <header className={styles.appHeader}>
        <div className={styles.appTitle}>Hog OSC Remote</div>
        <div className={classNames(styles.appStatus, headerStatusClass)}>
          {headerStatusLabel}
        </div>
      </header>

      <nav className={styles.appTabs}>
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

      <main className={styles.appMain}>
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


