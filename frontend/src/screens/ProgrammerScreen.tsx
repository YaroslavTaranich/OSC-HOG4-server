import React from 'react';
import { EncoderStrip } from '../ui/EncoderStrip';
import { Keypad } from '../ui/Keypad';

interface ProgrammerScreenProps {
  send: (payload: unknown) => void;
}

const KEYS_ROW_1 = ['FIXTURE', 'GROUP', 'INTENSITY', 'POSITION', 'COLOUR', 'BEAM'];
const KEYS_ROW_2 = ['FULL', 'OUT', 'CLEAR', 'ENTER', 'NEXT', 'LAST', 'FAN'];

export const ProgrammerScreen: React.FC<ProgrammerScreenProps> = ({ send }) => {
  const handleKey = (key: string) => {
    send({ type: 'keypress', key });
  };

  const handleEncoder = (index: number, delta: number) => {
    send({ type: 'encoder', encoder: index + 1, delta });
  };

  return (
    <div className="screen screen--programmer">
      <section className="screen-section">
        <div className="section-title">Programmer Keys</div>
        <div className="keys-grid">
          {KEYS_ROW_1.map((k) => (
            <button
              key={k}
              className="btn btn--primary"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="keys-grid">
          {KEYS_ROW_2.map((k) => (
            <button
              key={k}
              className="btn btn--primary"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section">
        <div className="section-title">Encoders</div>
        <EncoderStrip count={4} onChange={handleEncoder} />
      </section>

      <section className="screen-section">
        <div className="section-title">Keypad</div>
        <Keypad onKeyPress={handleKey} />
      </section>
    </div>
  );
};



