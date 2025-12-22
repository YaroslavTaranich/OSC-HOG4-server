import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const NUM_ROWS: string[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', 'THRU']
];

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const handle = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="keypad">
      {NUM_ROWS.map((row, idx) => (
        <div key={idx} className="keypad-row">
          {row.map((key) => (
            <button
              key={key}
              className="btn btn--secondary keypad-key"
              onClick={() => handle(key)}
              onTouchStart={() => handle(key)}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};



