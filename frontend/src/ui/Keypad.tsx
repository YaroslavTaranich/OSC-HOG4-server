import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

type KeyDef = {
  label: string;
  key: string;
  span?: number;
};

const ROWS: KeyDef[][] = [
  [
    { label: '⌫', key: 'BACKSPACE' },
    { label: '/', key: '/' },
    { label: '-', key: '-' },
    { label: '+', key: '+' }
  ],
  [
    { label: '7', key: '7' },
    { label: '8', key: '8' },
    { label: '9', key: '9' },
    { label: 'THRU', key: 'THRU' }
  ],
  [
    { label: '4', key: '4' },
    { label: '5', key: '5' },
    { label: '6', key: '6' },
    { label: 'FULL', key: 'FULL' }
  ],
  [
    { label: '1', key: '1' },
    { label: '2', key: '2' },
    { label: '3', key: '3' },
    { label: '@', key: '@' }
  ],
  [
    { label: '0', key: '0' },
    { label: '.', key: '.' },
    { label: 'ENTER', key: 'ENTER', span: 2 }
  ]
];

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const handle = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="keypad">
      {ROWS.map((row, idx) => (
        <div
          key={idx}
          className={`keypad-row ${idx === ROWS.length - 1 ? 'keypad-row--last' : ''}`}
        >
          {row.map(({ label, key, span }) => (
            <button
              key={key + String(span ?? 1)}
              className={`btn btn--secondary keypad-key playback-square ${
                span === 2 ? 'playback-square--double keypad-key--enter' : ''
              }`}
              style={span === 2 ? { gridColumn: 'span 2' } : undefined}
              onClick={() => handle(key)}
              onTouchStart={() => handle(key)}
            >
              {label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};



