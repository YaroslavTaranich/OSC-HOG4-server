import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useHogWebSocket } from '../hooks/useHogWebSocket';
import styles from './SettingsScreen.module.css';
import commonStyles from '../styles/common.module.css';
import buttonStyles from '../ui/HogButton.module.css';

type NotificationType = 'success' | 'error' | null;

// Regular expression for IPv4 address validation
// Matches: xxx.xxx.xxx.xxx where each xxx is 0-255
const IPv4_REGEX = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const isValidIPv4 = (ip: string): boolean => {
  return IPv4_REGEX.test(ip.trim());
};

export const SettingsScreen: React.FC = () => {
  const { send, status } = useHogWebSocket();

  const [ip, setIp] = useState(() => {
    if (typeof window === 'undefined') return '192.168.1.51';
    return window.localStorage.getItem('hogOscHost') || '192.168.1.51';
  });

  const [port, setPort] = useState(() => {
    if (typeof window === 'undefined') return '7001';
    return window.localStorage.getItem('hogOscPort') || '7001';
  });

  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const [ipError, setIpError] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const host = (ip || '').trim();
    const portNum = Number((port || '').trim());

    // Validate IPv4 address
    if (!host || !isValidIPv4(host)) {
      setIpError(true);
      setNotification({
        type: 'error',
        message: 'Invalid IP address format. Please enter a valid IPv4 address (e.g., 192.168.1.51).'
      });
      return;
    }

    setIpError(false);

    // Validate port
    if (!Number.isFinite(portNum) || portNum <= 0 || portNum > 65535) {
      setNotification({
        type: 'error',
        message: 'Invalid port number. Port must be between 1 and 65535.'
      });
      return;
    }

    if (status !== 'open') {
      setNotification({
        type: 'error',
        message: 'Cannot save settings: WebSocket connection is not open.'
      });
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hogOscHost', host);
      window.localStorage.setItem('hogOscPort', String(portNum));
    }

    try {
      send({
        type: 'osc_config',
        host,
        port: portNum
      });
      setNotification({
        type: 'success',
        message: 'Settings saved successfully! Reconnecting...'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      });
    }
  };

  return (
    <div className={commonStyles.screen}>
      <section className={commonStyles.screenSection}>
        <div className={commonStyles.sectionTitle}>OSC Connection Settings</div>
        {notification && (
          <div className={classNames(styles.notification, {
            [styles.notificationSuccess]: notification.type === 'success',
            [styles.notificationError]: notification.type === 'error'
          })}>
            {notification.message}
          </div>
        )}
        <form className={styles.settingsForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label className={styles.formLabel} htmlFor="osc-ip">
              IP Address
            </label>
            <input
              id="osc-ip"
              className={classNames(styles.formInput, {
                [styles.formInputError]: ipError
              })}
              type="text"
              value={ip}
              onChange={(e) => {
                setIp(e.target.value);
                if (ipError) {
                  setIpError(false);
                }
              }}
              onBlur={() => {
                if (ip && !isValidIPv4(ip)) {
                  setIpError(true);
                }
              }}
              placeholder="e.g. 192.168.0.10"
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel} htmlFor="osc-port">
              Port
            </label>
            <input
              id="osc-port"
              className={styles.formInput}
              type="number"
              min={1}
              max={65535}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="7001"
            />
          </div>

          <div className={styles.formRow}>
            <button type="submit" className={classNames(buttonStyles.btn, buttonStyles.btnPrimary)}>
              Save &amp; Reconnect
            </button>
          </div>
        </form>
        <p className={styles.settingsHint}>
          These settings control the IP and port used by the server to send OSC to the Hog console.
        </p>
      </section>
    </div>
  );
};



