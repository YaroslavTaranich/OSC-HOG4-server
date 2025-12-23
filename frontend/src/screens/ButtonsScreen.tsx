import React from 'react';
import { useHogWebSocket } from '../hooks/useHogWebSocket';
import { HogButton } from '../ui/HogButton';



const BUTTON_IDS = Array.from({ length: 12 }, (_, i) => i + 1);

export const ButtonsScreen: React.FC = () => {
  return (
    <div className="screen screen--buttons">
      <section className="screen-section">
        <div className="section-title">Programmable Controls</div>
        <div className="buttons-grid">
          {BUTTON_IDS.map((id) => (
            <HogButton
              key={id}
              className="btn btn--primary btn--flash"
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



