import React from 'react';
import classNames from 'classnames';
import { HogButton } from './HogButton';
import styles from './Keypad.module.css';
import buttonStyles from './HogButton.module.css';
import commonStyles from '../styles/common.module.css';


type KeyDef = {
  label: string;
  key: string;
  span?: number;
};

const ROWS: KeyDef[][] = [
  [
    { label: '⌫', key: 'BACKSPACE' },
    { label: '/', key: 'slash' },
    { label: '-', key: 'minus' },
    { label: '+', key: 'plus' }
  ],
  [
    { label: '7', key: 'seven' },
    { label: '8', key: 'eight' },
    { label: '9', key: 'nine' },
    { label: 'THRU', key: 'THRU' }
  ],
  [
    { label: '4', key: 'four' },
    { label: '5', key: 'five' },
    { label: '6', key: 'six' },
    { label: 'FULL', key: 'FULL' }
  ],
  [
    { label: '1', key: 'one' },
    { label: '2', key: 'two' },
    { label: '3', key: 'three' },
    { label: '@', key: 'at' }
  ],
  [
    { label: '0', key: 'zero' },
    { label: '.', key: 'period' },
    { label: 'ENTER', key: 'ENTER', span: 2 }
  ]
];

export const Keypad: React.FC = () => {

  return (
    <div className={styles.keypad}>
      {ROWS.map((row, idx) => (
        <div
          key={idx}
          className={classNames(styles.keypadRow, {
            [styles.keypadRowLast]: idx === ROWS.length - 1
          })}
        >
          {row.map(({ label, key, span }) => (
            <HogButton
              key={key + String(span ?? 1)}
              className={classNames(
                buttonStyles.btnSecondary,
                styles.keypadKey,
                commonStyles.playbackSquare,
                {
                  [commonStyles.playbackSquareDouble]: span === 2,
                  [styles.keypadKeyEnter]: span === 2
                }
              )}
              style={span === 2 ? { gridColumn: 'span 2' } : undefined}
              buttonKey={key}
            >
              {label}
            </HogButton>
          ))}
        </div>
      ))}
    </div>
  );
};



