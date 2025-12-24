import React from 'react';
import classNames from 'classnames';
import { HogButton } from '../ui/HogButton';
import styles from './ButtonsScreen.module.css';
import commonStyles from '../styles/common.module.css';
import buttonStyles from '../ui/HogButton.module.css';

const BUTTON_IDS = Array.from({ length: 12 }, (_, i) => i + 1);

export const ButtonsScreen: React.FC = () => {
  return (
    <div className={classNames(commonStyles.screen, commonStyles.screenButtons)}>
      <section className={commonStyles.screenSection}>
        <div className={commonStyles.sectionTitle}>Programmable Controls</div>
        <div className={styles.buttonsGrid}>
          {BUTTON_IDS.map((id) => (
            <HogButton
              key={id}
              className={classNames(buttonStyles.btnPrimary, buttonStyles.btnFlash)}
              buttonKey={`h${id}`}
            >
              BTN {id}
            </HogButton>
          ))}
        </div>
      </section>
    </div>
  );
};
