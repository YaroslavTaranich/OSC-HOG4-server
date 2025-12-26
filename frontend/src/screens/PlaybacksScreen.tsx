import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useHogWebSocket } from '../hooks/useHogWebSocket';
import { HogButton } from '../ui/HogButton';
import styles from './PlaybacksScreen.module.css';
import commonStyles from '../styles/common.module.css';
import buttonStyles from '../ui/HogButton.module.css';
import { HogChooseButton } from '../ui/HogChooseButton';
import { ChooseButtonContextProvider } from '../hooks/useChooseButtonContext';

const TOTAL_PLAYBACKS = 100;
const PAGE_SIZE = 10;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

interface VerticalFaderProps {
  value: number; // 0..100
  onChange: (value: number) => void;
}

const VerticalFader: React.FC<VerticalFaderProps> = ({ value, onChange }) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const wheelTimeout = useRef<number | null>(null);

  const setValueFromClientY = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = clamp((rect.bottom - clientY) / rect.height, 0, 1);
    onChange(Math.round(rel * 100));
  };

  /* -------- pointer -------- */

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();

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
    } catch (error) {
      console.error(error);
    }

    activePointerId.current = null;
  };

  /* -------- wheel -------- */

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const delta = -e.deltaY / 20;
    onChange(clamp(Math.round(value + delta), 0, 100));

    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }
  };

  return (
    <div className={styles.playbackFader}>
      <div
        ref={trackRef}
        className={styles.playbackFaderTrack}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        onWheel={handleWheel}
      >
        <div className={styles.playbackFaderThumb} style={{ bottom: `${value}%` }} />
      </div>
    </div>
  );
};

export const PlaybacksScreen: React.FC = () => {
  const { send } = useHogWebSocket();

  const pages = useMemo(() => Math.ceil(TOTAL_PLAYBACKS / PAGE_SIZE), []);
  const [page, setPage] = useState(1);
  const [levels, setLevels] = useState<Record<number, number>>({});

  const currentPlaybacks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE + 1;
    return Array.from({ length: PAGE_SIZE }, (_, i) => start + i).filter(
      (n) => n <= TOTAL_PLAYBACKS,
    );
  }, [page]);

  const sendFader = (playback: number, value: number) => {
    const normalized = value / 100;
    send({ type: 'playback_fader', playback, value: normalized });
  };

  const handleSliderChange = (playback: number, value: number) => {
    setLevels((prev) => ({ ...prev, [playback]: value }));
    sendFader(playback, value);
  };

  return (
    <ChooseButtonContextProvider>
      <div className={classNames(commonStyles.screen, commonStyles.screenPlaybacks)}>
        <section className={commonStyles.screenSection}>
          <div className={commonStyles.sectionTitle}>Page</div>
          <div className={styles.playbackPages}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={classNames(
                  buttonStyles.btn,
                  buttonStyles.btnSecondary,
                  styles.playbackPageBtn,
                  {
                    [commonStyles.playbackBtnActive]: page === p,
                  },
                )}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className={styles.playbackPagesSelect}>
            <select value={page} onChange={(e) => setPage(Number(e.target.value))}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className={commonStyles.screenSection}>
          <div className={commonStyles.sectionTitle}>
            Playbacks {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, TOTAL_PLAYBACKS)}
          </div>
          <div className={styles.playbackFaders}>
            {currentPlaybacks.map((n) => {
              const level = levels[n] ?? 0;
              return (
                <div
                  key={n}
                  className={classNames(styles.playbackCard, styles.playbackCardVertical)}
                >
                  <div className={styles.playbackCardHeader}>
                    <span className={styles.playbackCardLabel}>PB {n}</span>
                  </div>
                  <div
                    className={classNames(styles.playbackCardValue, styles.playbackCardValueBelow)}
                  >
                    {level.toFixed(0)}%
                  </div>

                  <div className={styles.playbackVerticalStack}>
                    <HogChooseButton
                      className={classNames(buttonStyles.btnDanger, commonStyles.playbackSquare)}
                      faderNumber={n}
                    >
                      CHOOSE
                    </HogChooseButton>
                    <HogButton
                      className={classNames(buttonStyles.btnAccent, commonStyles.playbackSquare)}
                      buttonKey={`go/${n}`}
                    >
                      GO
                    </HogButton>
                    <HogButton
                      className={classNames(buttonStyles.btnSecondary, commonStyles.playbackSquare)}
                      buttonKey={`pause/${n}`}
                    >
                      PAUSE
                    </HogButton>
                    <HogButton
                      className={classNames(buttonStyles.btnSecondary, commonStyles.playbackSquare)}
                      buttonKey={`goback/${n}`}
                    >
                      BACK
                    </HogButton>

                    <div className={styles.playbackSliderWrapper}>
                      <VerticalFader value={level} onChange={(val) => handleSliderChange(n, val)} />
                    </div>

                    <HogButton
                      className={classNames(buttonStyles.btnSecondary, commonStyles.playbackSquare)}
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
    </ChooseButtonContextProvider>
  );
};
