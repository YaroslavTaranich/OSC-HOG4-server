import React from 'react';
import { EncoderStrip } from '../ui/EncoderStrip';
import { Keypad } from '../ui/Keypad';

interface ProgrammerScreenProps {
  send: (payload: unknown) => void;
}

const PARAM_SELECTION_KEYS: { label: string; key: string }[] = [
  { label: 'INT', key: 'INTENSITY' },
  { label: 'POSITION', key: 'POSITION' },
  { label: 'COLOUR', key: 'COLOUR' },
  { label: 'BEAM', key: 'BEAM' },
  { label: 'EFFECT', key: 'EFFECT' },
  { label: 'GROUP', key: 'GROUP' },
  { label: 'FIXTURE', key: 'FIXTURE' }
];
const SETUP_KEYS = ['SETUP', 'GOTO', 'SET', 'PIG', 'FAN', 'OPEN'];
const LIVE_SCENE_KEYS = ['LIVE', 'SCENE', 'CUE', 'MACRO', 'LIST', 'PAGE'];
const EDIT_KEYS = ['DELETE', 'MOVE', 'COPY', 'UPDATE', 'MERGE', 'RECORD'];
const HIGHLIGHT_KEYS = ['HIGHLIGHT', 'BLIND', 'CLEAR'];
const NAV_KEYS = ['NEXT', 'ALL', 'PREV'];

export const ProgrammerScreen: React.FC<ProgrammerScreenProps> = ({ send }) => {
  const handleKey = (key: string) => {
    send({ type: 'keypress', key });
  };

  const handleEncoder = (index: number, delta: number) => {
    send({ type: 'encoder', encoder: index + 1, delta });
  };

  return (
    <div className="screen screen--programmer">
      <section className="screen-section section-encoders">
        <div className="section-title">Encoders</div>
        <EncoderStrip count={4} onChange={handleEncoder} />
      </section>

      <section className="screen-section section-params">
        <div className="section-title">Setup</div>
        <div className="params-row">
          {SETUP_KEYS.map((k) => (
            <button
              key={k}
              className="btn btn--primary playback-square"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section section-params">
        <div className="section-title">Parameters / Selection</div>
        <div className="params-row">
          {PARAM_SELECTION_KEYS.map((item) => (
            <button
              key={item.key}
              className="btn btn--primary playback-square"
              onClick={() => handleKey(item.key)}
              onTouchStart={() => handleKey(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section section-params">
        <div className="section-title">Live / Scene</div>
        <div className="params-row">
          {LIVE_SCENE_KEYS.map((k) => (
            <button
              key={k}
              className="btn btn--primary playback-square"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section section-params">
        <div className="section-title">Edit</div>
        <div className="params-row">
          {EDIT_KEYS.map((k) => (
            <button
              key={k}
              className="btn btn--primary playback-square"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section section-keypad">
        <div className="section-title">Keypad</div>
        <Keypad onKeyPress={handleKey} />
      </section>

      <section className="screen-section section-params section-highlight">
        <div className="section-title">Highlight</div>
        <div className="params-row">
          {HIGHLIGHT_KEYS.map((k) => (
            <button
              key={k}
              className="btn btn--primary playback-square playback-square--double"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="screen-section section-params section-nav">
        <div className="section-title">Navigation</div>
        <div className="params-row">
          {NAV_KEYS.map((k) => (
            <button
              key={k}
              className="btn btn--primary playback-square playback-square--double"
              onClick={() => handleKey(k)}
              onTouchStart={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};



