import React, {
    createContext, PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';

type Status = 'connecting' | 'open' | 'closed';

interface HogWebSocketContextValue {
  status: Status;
  oscError: boolean;
  send: (payload: unknown) => void;
}

/* ---------- context ---------- */

const HogWebSocketContext = createContext<HogWebSocketContextValue | null>(null);

/* ---------- provider ---------- */

interface HogWebSocketProviderProps extends PropsWithChildren {
  url: string;
}

export const HogWebSocketProvider: React.FC<HogWebSocketProviderProps> = ({
  url,
  children
}) => {
  const [status, setStatus] = useState<Status>('connecting');
  const [oscError, setOscError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      setStatus('connecting');
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted) return;
        setStatus('open');
        // Clear OSC error state on successful WS reconnect
        setOscError(false);
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        setStatus('closed');

        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }

        reconnectTimeout.current = window.setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data?.type) {
            case 'osc_error':
              setOscError(true);
              break;
            case 'osc_config_ok':
            case 'hello':
              setOscError(false);
              break;
            default:
              // ignore other message types
              break;
          }
        } catch {
          // ignore non-JSON messages
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  const send = useCallback((payload: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);


  return (
    <HogWebSocketContext.Provider value={{ status, oscError, send }}>
      {children}
    </HogWebSocketContext.Provider>
  )
};

/* ---------- hook ---------- */

export const useHogWebSocket = () => {
  const ctx = useContext(HogWebSocketContext);
  if (!ctx) {
    throw new Error('useHogWebSocket must be used inside HogWebSocketProvider');
  }
  return ctx;
};
