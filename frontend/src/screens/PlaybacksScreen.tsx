import React, { useMemo, useRef, useState } from 'react';
import { useHogWebSocket } from '../hooks/useHogWebSocket';
import { HogButton } from '../ui/HogButton';

const TOTAL_PLAYBACKS = 100;
const PAGE_SIZE = 10;

type Action = 'go' | 'back' | 'release' | 'flash';

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));


interface VerticalFaderProps {
  value: number; // 0..100
  onStart: () => void;
  onChange: (value: number) => void;
  onEnd: () => void;
}

const VerticalFader: React.FC<VerticalFaderProps> = ({
  value,
  onStart,
  onChange,
  onEnd
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const isActive = useRef(false);
  const wheelTimeout = useRef<number | null>(null);

  const startInteraction = () => {
    if (isActive.current) return;
    isActive.current = true;
    onStart();
  };

  const endInteraction = () => {
    if (!isActive.current) return;
    isActive.current = false;
    onEnd();
  };

  const setValueFromClientY = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = clamp((rect.bottom - clientY) / rect.height, 0, 1);
    onChange(Math.round(rel * 100));
  };

  /* -------- pointer -------- */

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startInteraction();

    activePointerId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setValueFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    setValueFromClientY(e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch { }

    activePointerId.current = null;
    endInteraction();
  };

  /* -------- wheel -------- */

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    startInteraction();

    const delta = -e.deltaY / 20;
    onChange(clamp(Math.round(value + delta), 0, 100));

    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }

    wheelTimeout.current = window.setTimeout(() => {
      endInteraction();
    }, 200);
  };

  return (
    <div className="playback-fader">
      <div
        ref={trackRef}
        className="playback-fader__track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onWheel={handleWheel}
      >
        <div className="playback-fader__thumb" style={{ bottom: `${value}%` }} />
      </div>
    </div>
  );
};

export const PlaybacksScreen: React.FC = () => {
  const { send } = useHogWebSocket()

  const pages = useMemo(() => Math.ceil(TOTAL_PLAYBACKS / PAGE_SIZE), []);
  const [page, setPage] = useState(1);
  const [levels, setLevels] = useState<Record<number, number>>({});

  const currentPlaybacks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE + 1;
    return Array.from({ length: PAGE_SIZE }, (_, i) => start + i).filter((n) => n <= TOTAL_PLAYBACKS);
  }, [page]);

  const sendAction = (playback: number, action: Action) => {
    send({ type: 'playback', playback, action });
  };

  const sendFader = (playback: number, value: number) => {
    const normalized = value / 100;
    send({ type: 'playback_fader', playback, value: normalized });
  };

  const handleSliderChange = (playback: number, value: number) => {
    setLevels((prev) => ({ ...prev, [playback]: value }));
    sendFader(playback, value);
  };
  const handleSliderStart = (playback: number) => {
    send({ type: 'playback_fader_start', playback })
  };
  const handleSliderEnd = (playback: number) => {
    send({ type: 'playback_fader_end', playback })
  };

  return (
    <div className="screen screen--playbacks">
      <section className="screen-section">
        <div className="section-title">Page</div>
        <div className="playback-pages">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn btn--secondary playback-page-btn ${page === p ? 'playback-btn--active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="playback-pages-select">
          <select value={page} onChange={(e) => setPage(Number(e.target.value))}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Page {p}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="screen-section">
        <div className="section-title">
          Playbacks {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, TOTAL_PLAYBACKS)}
        </div>
        <div className="playback-faders">
          {currentPlaybacks.map((n) => {
            const level = levels[n] ?? 0;
            return (
              <div key={n} className="playback-card playback-card--vertical">
                <div className="playback-card__header">
                  <span className="playback-card__label">PB {n}</span>
                </div>
                <div className="playback-card__value playback-card__value--below">{level.toFixed(0)}%</div>

                <div className="playback-vertical-stack">
                  <HogButton
                    className="btn btn--danger playback-square"
                    buttonKey={`choose/${n}`}
                  >
                    CHOOSE
                  </HogButton>
                  <HogButton
                    className="btn btn--accent playback-square"
                    buttonKey={`go/${n}`}
                  >
                    GO
                  </HogButton>
                  <HogButton
                    className="btn btn--secondary playback-square"
                    buttonKey={`pause/${n}`}
                  >
                    PAUSE
                  </HogButton>
                  <HogButton
                    className="btn btn--secondary playback-square"
                    buttonKey={`goback/${n}`}
                  >
                    BACK
                  </HogButton>

                  <div className="playback-slider-wrapper">
                  <VerticalFader value={level} onChange={(val) => handleSliderChange(n, val)} onStart={() => handleSliderStart(n)} onEnd={() => handleSliderEnd(n)} />
                  </div>

                  <HogButton
                    className="btn btn--secondary playback-square"
                    buttonKey={`flash/${n}`}
                  >
                    FLASH
                  </HogButton>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};



