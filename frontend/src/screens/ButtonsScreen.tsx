import React from 'react';

interface ButtonsScreenProps {
  send: (payload: unknown) => void;
}

const BUTTON_IDS = Array.from({ length: 12 }, (_, i) => i + 1);

export const ButtonsScreen: React.FC<ButtonsScreenProps> = ({ send }) => {
  const handlePress = (id: number) => {
    send({ type: 'button', id });
  };

  return (
    <div className="screen screen--buttons">
      <section className="screen-section">
        <div className="section-title">Programmable Controls</div>
        <div className="buttons-grid">
          {BUTTON_IDS.map((id) => (
            <button
              key={id}
              className="btn btn--primary btn--tall"
              onClick={() => handlePress(id)}
            >
              BTN {id}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};



