import React, { useState } from 'react';
import { useHogWebSocket } from '../hooks/useHogWebSocket';

export const SettingsScreen: React.FC = () => {
  const { send } = useHogWebSocket();

  const [ip, setIp] = useState(() => {
    if (typeof window === 'undefined') return '192.168.1.51';
    return window.localStorage.getItem('hogOscHost') || '192.168.1.51';
  });

  const [port, setPort] = useState(() => {
    if (typeof window === 'undefined') return '7001';
    return window.localStorage.getItem('hogOscPort') || '7001';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const host = (ip || '').trim();
    const portNum = Number((port || '').trim());

    if (!host || !Number.isFinite(portNum) || portNum <= 0 || portNum > 65535) {
      // можно добавить отображение ошибки, пока просто игнорируем
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hogOscHost', host);
      window.localStorage.setItem('hogOscPort', String(portNum));
    }

    send({
      type: 'osc_config',
      host,
      port: portNum
    });
  };

  return (
    <div className="screen screen--settings">
      <section className="screen-section">
        <div className="section-title">OSC Connection Settings</div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label" htmlFor="osc-ip">
              IP Address
            </label>
            <input
              id="osc-ip"
              className="form-input"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="e.g. 192.168.0.10"
            />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="osc-port">
              Port
            </label>
            <input
              id="osc-port"
              className="form-input"
              type="number"
              min={1}
              max={65535}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="7001"
            />
          </div>

          <div className="form-row">
            <button type="submit" className="btn btn--primary">
              Save &amp; Reconnect
            </button>
          </div>
        </form>
        <p className="settings-hint">
          These settings control the IP and port used by the server to send OSC to the Hog console.
        </p>
      </section>
    </div>
  );
};



