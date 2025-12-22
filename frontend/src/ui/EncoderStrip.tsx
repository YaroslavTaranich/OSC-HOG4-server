import React, { useRef, useState } from 'react';

interface EncoderStripProps {
  count: number;
  onChange: (index: number, delta: number) => void;
}

export const EncoderStrip: React.FC<EncoderStripProps> = ({ count, onChange }) => {
  const trackRefs = useRef<(HTMLDivElement | null)[]>(Array(count).fill(null));
  const activePointer = useRef<(number | null)[]>(Array(count).fill(null));
  const activeInterval = useRef<(number | null)[]>(Array(count).fill(null));
  const currentNorm = useRef<number[]>(Array(count).fill(0));
  const [intensity, setIntensity] = useState<number[]>(Array(count).fill(0)); // visual feedback -1..1

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
    const norm = Math.max(-1, Math.min(1, (centerY - clientY) / half)); // -1..1
    return norm;
  };

  const handlePointerDown = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    activePointer.current[index] = event.pointerId;
    try {
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    const norm = computeNormFromClientY(index, event.clientY);
    updateNorm(index, norm);
    startInterval(index);
  };

  const handlePointerMove = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current[index] !== event.pointerId) return;
    const norm = computeNormFromClientY(index, event.clientY);
    updateNorm(index, norm);
  };

  const handlePointerEnd = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current[index] !== event.pointerId) return;
    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    activePointer.current[index] = null;
    stopInterval(index);
    updateNorm(index, 0);
  };

  const updateNorm = (index: number, norm: number) => {
    currentNorm.current[index] = norm;
    setIntensity((prev) => {
      const next = [...prev];
      next[index] = norm;
      return next;
    });
  };

  const startInterval = (index: number) => {
    if (activeInterval.current[index] != null) return;
    const id = window.setInterval(() => {
      const norm = currentNorm.current[index] ?? 0;
      const delta = norm * 0.08; // reduced sensitivity
      sendDelta(index, delta);
    }, 120);
    activeInterval.current[index] = id;
  };

  const stopInterval = (index: number) => {
    const id = activeInterval.current[index];
    if (id != null) {
      window.clearInterval(id);
      activeInterval.current[index] = null;
    }
  };

  const handleWheel = (index: number, event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY / 900; // reduced sensitivity
    sendDelta(index, delta);
  };

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
                    boxShadow: `0 4px 12px rgba(0,0,0,0.6), 0 0 0 ${2 + glow * 2}px rgba(56,189,248,${
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



