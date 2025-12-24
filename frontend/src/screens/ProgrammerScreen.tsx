import React from 'react';
import classNames from 'classnames';
import { EncoderStrip } from '../ui/EncoderStrip';
import { Keypad } from '../ui/Keypad';
import { HogButton } from "../ui/HogButton";
import { useHogWebSocket } from "../hooks/useHogWebSocket";
import styles from './ProgrammerScreen.module.css';
import commonStyles from '../styles/common.module.css';
import buttonStyles from '../ui/HogButton.module.css';

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
const NAV_KEYS = ['NEXT', 'ALL', 'BACK'];

export const ProgrammerScreen: React.FC = () => {
  const { send } = useHogWebSocket()

  const handleEncoder = (index: number, delta: number) => {
    send({ type: 'encoder', encoder: index + 1, delta });
  };
  const handleEncoderStart = (index: number) => {
    send({ type: 'encoder_start', encoder: index + 1 });
  };
  const handleEncoderEnd = (index: number) => {
    send({ type: 'encoder_end', encoder: index + 1 });
  };

  return (
    <div className={classNames(commonStyles.screen, commonStyles.screenProgrammer)}>
      <section className={classNames(commonStyles.screenSection, styles.sectionParams, styles.sectionHighlight)}>
        <div className={commonStyles.sectionTitle}>Highlight</div>
        <div className={styles.paramsRow}>
          {HIGHLIGHT_KEYS.map((k) => (
            <HogButton
              key={k}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare, commonStyles.playbackSquareDouble)}
              buttonKey={k}
            >
              {k}
            </HogButton>
          ))}
        </div>
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionParams, styles.sectionNav)}>
        <div className={commonStyles.sectionTitle}>Navigation</div>
        <div className={styles.paramsRow}>
          {NAV_KEYS.map((k) => (
            <HogButton
              key={k}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare, commonStyles.playbackSquareDouble)}
              buttonKey={k}
            >
              {k}
            </HogButton>
          ))}
        </div>
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionParams)}>
        <div className={commonStyles.sectionTitle}>Parameters / Selection</div>
        <div className={styles.paramsRow}>
          {PARAM_SELECTION_KEYS.map((item) => (
            <HogButton
              key={item.key}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare)}
              buttonKey={item.key}
            >
              {item.label}
            </HogButton>
          ))}
        </div>
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionEncoders)}>
        <div className={commonStyles.sectionTitle}>Encoders</div>
        <EncoderStrip count={4} onChange={handleEncoder} onStart={handleEncoderStart} onEnd={handleEncoderEnd} />
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionKeypad)}>
        <div className={commonStyles.sectionTitle}>Keypad</div>
        <Keypad />
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionParams)}>
        <div className={commonStyles.sectionTitle}>Setup</div>
        <div className={styles.paramsRow}>
          {SETUP_KEYS.map((k) => (
            <HogButton
              key={k}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare)}
              buttonKey={k}
            >
              {k}
            </HogButton>
          ))}
        </div>
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionParams)}>
        <div className={commonStyles.sectionTitle}>Live / Scene</div>
        <div className={styles.paramsRow}>
          {LIVE_SCENE_KEYS.map((k) => (
            <HogButton
              key={k}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare)}
              buttonKey={k}
            >
              {k}
            </HogButton>
          ))}
        </div>
      </section>

      <section className={classNames(commonStyles.screenSection, styles.sectionParams)}>
        <div className={commonStyles.sectionTitle}>Edit</div>
        <div className={styles.paramsRow}>
          {EDIT_KEYS.map((k) => (
            <HogButton
              key={k}
              className={classNames(buttonStyles.btnPrimary, commonStyles.playbackSquare)}
              buttonKey={k}
            >
              {k}
            </HogButton>
          ))}
        </div>
      </section>
    </div>
  );
};



