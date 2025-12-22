import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'connecting' | 'open' | 'closed';

export function useHogWebSocket(url: string) {
  const [status, setStatus] = useState<Status>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  useEffect(() => {
    function connect() {
      setStatus('connecting');
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('open');
      };

      ws.onclose = () => {
        setStatus('closed');
        if (reconnectTimeout.current !== null) {
          window.clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = window.setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        // Optional: handle hello / debug messages
        // console.log('WS message', event.data);
      };
    }

    connect();

    return () => {
      if (reconnectTimeout.current !== null) {
        window.clearTimeout(reconnectTimeout.current);
      }
      socketRef.current?.close();
    };
  }, [url]);

  const send = useCallback((payload: unknown) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { status, send };
}



