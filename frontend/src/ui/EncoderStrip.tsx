import React, { useRef } from 'react';

interface EncoderStripProps {
  count: number;
  onChange: (index: number, delta: number) => void;
}

export const EncoderStrip: React.FC<EncoderStripProps> = ({ count, onChange }) => {
  const lastYRef = useRef<(number | null)[]>(Array(count).fill(null));

  const handleWheel = (index: number, event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = -event.deltaY / 500; // tune sensitivity
    if (delta !== 0) {
      onChange(index, delta);
    }
  };

  const handlePointerDown = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    lastYRef.current[index] = event.clientY;
  };

  const handlePointerMove = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.buttons) return;
    const lastY = lastYRef.current[index];
    if (lastY == null) return;
    const dy = lastY - event.clientY;
    lastYRef.current[index] = event.clientY;
    const delta = dy / 300; // tune sensitivity
    if (delta !== 0) {
      onChange(index, delta);
    }
  };

  const handlePointerUp = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    lastYRef.current[index] = null;
  };

  return (
    <div className="encoder-strip">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="encoder"
          onWheel={(e) => handleWheel(i, e)}
          onPointerDown={(e) => handlePointerDown(i, e)}
          onPointerMove={(e) => handlePointerMove(i, e)}
          onPointerUp={(e) => handlePointerUp(i, e)}
        >
          <div className="encoder-knob" />
          <div className="encoder-label">Enc {i + 1}</div>
        </div>
      ))}
    </div>
  );
};



