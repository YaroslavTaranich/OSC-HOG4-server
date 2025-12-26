import { createContext, FC, PropsWithChildren, useContext, useState } from 'react';

type ChooseButtonContextProps = {
  setChosenFader: (v: number | null) => void;
  chosenFader: number | null;
};

const ChooseButtonContext = createContext<ChooseButtonContextProps | null>(null);

export const ChooseButtonContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [chosenFader, setChosenFader] = useState<number | null>(null);

  return (
    <ChooseButtonContext.Provider value={{ setChosenFader, chosenFader }}>
      {children}
    </ChooseButtonContext.Provider>
  );
};

export const useChooseButtonContext = () => {
  const ctx = useContext(ChooseButtonContext);
  if (!ctx) {
    throw new Error('useHogWebSocket must be used inside HogWebSocketProvider');
  }
  return ctx;
};
