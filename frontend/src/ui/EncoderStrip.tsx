import React, { useRef, useState } from 'react';

interface EncoderStripProps {
  count: number;
  onStart: (index: number) => void;
  onChange: (index: number, delta: number) => void;
  onEnd: (index: number) => void;
}

export const EncoderStrip: React.FC<EncoderStripProps> = ({
  count,
  onStart,
  onChange,
  onEnd
}) => {
  const trackRefs = useRef<(HTMLDivElement | null)[]>(Array(count).fill(null));

  const activePointer = useRef<(number | null)[]>(Array(count).fill(null));
  const activeInterval = useRef<(number | null)[]>(Array(count).fill(null));
  const currentNorm = useRef<number[]>(Array(count).fill(0));

  const isActive = useRef<boolean[]>(Array(count).fill(false));
  const wheelTimeout = useRef<(number | null)[]>(Array(count).fill(null));

  const [intensity, setIntensity] = useState<number[]>(Array(count).fill(0));

  /* ---------------- helpers ---------------- */

  const startInteraction = (index: number) => {
    if (isActive.current[index]) return;
    isActive.current[index] = true;
    onStart(index);
  };

  const endInteraction = (index: number) => {
    if (!isActive.current[index]) return;
    isActive.current[index] = false;
    onEnd(index);
  };

  const sendDelta = (index: number, delta: number) => {
    if (delta !== 0) {
      onChange(index, delta);
    }
  };

  const computeNormFromClientY = (index: number, clientY: number) => {
    const rect = trackRefs.current[index]?.getBoundingClientRect();
    if (!rect) return 0;
    const centerY = rect.top + rect.height / 2;
    const half = rect.height / 2;
    return Math.max(-1, Math.min(1, (centerY - clientY) / half));
  };

  const updateNorm = (index: number, norm: number) => {
    currentNorm.current[index] = norm;
    setIntensity((prev) => {
      const next = [...prev];
      next[index] = norm;
      return next;
    });
  };

  /* ---------------- pointer ---------------- */

  const startInterval = (index: number) => {
    if (activeInterval.current[index] != null) return;

    const id = window.setInterval(() => {
      const norm = currentNorm.current[index] ?? 0;
      const delta = norm * 0.08;
      sendDelta(index, delta);
    }, 120);

    activeInterval.current[index] = id;
  };

  const stopInterval = (index: number) => {
    const id = activeInterval.current[index];
    if (id != null) {
      clearInterval(id);
      activeInterval.current[index] = null;
    }
  };

  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startInteraction(index);

    activePointer.current[index] = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const norm = computeNormFromClientY(index, e.clientY);
    updateNorm(index, norm);
    startInterval(index);
  };

  const handlePointerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current[index] !== e.pointerId) return;
    const norm = computeNormFromClientY(index, e.clientY);
    updateNorm(index, norm);
  };

  const handlePointerEnd = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current[index] !== e.pointerId) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    activePointer.current[index] = null;
    stopInterval(index);
    updateNorm(index, 0);
    endInteraction(index);
  };

  /* ---------------- wheel ---------------- */

  const handleWheel = (index: number, e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    startInteraction(index);

    const delta = -e.deltaY / 900;
    sendDelta(index, delta);

    if (wheelTimeout.current[index]) {
      clearTimeout(wheelTimeout.current[index]!);
    }

    wheelTimeout.current[index] = window.setTimeout(() => {
      endInteraction(index);
    }, 200);
  };

  /* ---------------- render ---------------- */

  return (
    <div className="encoder-strip">
      {Array.from({ length: count }, (_, i) => {
        const glow = Math.abs(intensity[i] ?? 0);

        return (
          <div
            key={i}
            className="encoder"
            onWheel={(e) => handleWheel(i, e)}
            onPointerDown={(e) => handlePointerDown(i, e)}
            onPointerMove={(e) => handlePointerMove(i, e)}
            onPointerUp={(e) => handlePointerEnd(i, e)}
            onPointerCancel={(e) => handlePointerEnd(i, e)}
            onPointerLeave={(e) => handlePointerEnd(i, e)}
          >
            <div className="encoder-fader">
              <div
                ref={(el) => (trackRefs.current[i] = el)}
                className="encoder-fader__track"
              >
                <div className="encoder-fader__centerline" />
                <div
                  className="encoder-fader__thumb"
                  style={{
                    top: `${(0.5 - (currentNorm.current[i] || 0) / 2) * 100}%`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.6),
                      0 0 0 ${2 + glow * 2}px rgba(56,189,248,${
                        0.25 + glow * 0.35
                      })`
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
