import React, { useMemo, useRef, useState } from 'react';

interface PlaybacksScreenProps {
  send: (payload: unknown) => void;
}

const TOTAL_PLAYBACKS = 100;
const PAGE_SIZE = 10;

type Action = 'go' | 'back' | 'release' | 'flash';

interface VerticalFaderProps {
  value: number; // 0..100
  onChange: (value: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const VerticalFader: React.FC<VerticalFaderProps> = ({ value, onChange }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);

  const setValueFromClientY = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = clamp((rect.bottom - clientY) / rect.height, 0, 1);
    const next = Math.round(rel * 100);
    onChange(next);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    activePointerId.current = e.pointerId;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    setValueFromClientY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    setValueFromClientY(e.clientY);
  };

  const clearPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    activePointerId.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = -e.deltaY / 20; // tune sensitivity
    const next = clamp(value + delta, 0, 100);
    onChange(Math.round(next));
  };

  return (
    <div className="playback-fader">
      <div
        ref={trackRef}
        className="playback-fader__track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearPointer}
        onPointerCancel={clearPointer}
        onPointerLeave={clearPointer}
        onWheel={handleWheel}
      >
        <div className="playback-fader__thumb" style={{ bottom: `${value}%` }} />
      </div>
    </div>
  );
};

export const PlaybacksScreen: React.FC<PlaybacksScreenProps> = ({ send }) => {
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
                  <button
                    className="btn btn--danger playback-square"
                    onClick={() => sendAction(n, 'release')}
                  >
                    RELEASE
                  </button>
                  <button
                    className="btn btn--accent playback-square"
                    onClick={() => sendAction(n, 'go')}
                  >
                    GO
                  </button>
                  <button
                    className="btn btn--primary playback-square"
                    onClick={() => sendAction(n, 'back')}
                  >
                    BACK
                  </button>

                  <div className="playback-slider-wrapper">
                    <VerticalFader value={level} onChange={(val) => handleSliderChange(n, val)} />
                  </div>

                  <button
                    className="btn btn--secondary playback-square"
                    onClick={() => sendAction(n, 'flash')}
                  >
                    FLASH
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};



