import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useHogWebSocket } from '../hooks/useHogWebSocket';
import styles from './HogButton.module.css';
import { EncoderStrip } from './EncoderStrip';
import { useChooseButtonContext } from '../hooks/useChooseButtonContext';

interface HogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  faderNumber: number;
}

export const HogChooseButton: React.FC<HogButtonProps> = ({
  children,
  faderNumber,
  className,
  ...props
}) => {
  const { send } = useHogWebSocket();
  const [pressed, setPressed] = useState(false);
  const { setChosenFader, chosenFader } = useChooseButtonContext();

  useEffect(() => {
    if (chosenFader && chosenFader !== faderNumber && pressed) {
      send({
        type: 'button_end',
        key: 'choose/' + faderNumber,
      });
      setPressed(false);
    }
  }, [chosenFader, pressed, faderNumber]);

  const handleClick = () => {
    if (pressed) {
      send({
        type: 'button_end',
        key: 'choose/' + faderNumber,
      });
    } else {
      setTimeout(() => {
        send({
          type: 'button_start',
          key: 'choose/' + faderNumber,
        });
      }, 50);
      setChosenFader(faderNumber);
    }

    setPressed((p) => !p);
  };

  const onEncodersClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <button
      {...props}
      className={classNames(styles.btn, className, { [styles.btnEncoderActive]: pressed })}
      onClick={handleClick}
    >
      {children}
      {pressed && !!chosenFader && chosenFader === faderNumber && (
        <div
          onClick={onEncodersClick}
          className={classNames(styles.btnEncoders, {
            [styles.btnEncodersFirst]: faderNumber % 10 === 1 || faderNumber % 10 === 2,
            [styles.btnEncodersLast]: faderNumber % 10 === 0 || faderNumber % 10 === 9,
          })}
        >
          <EncoderStrip />
        </div>
      )}
    </button>
  );
};
