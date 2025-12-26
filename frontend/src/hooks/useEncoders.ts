import { useHogWebSocket } from './useHogWebSocket';

export const useEncoders = () => {
  const { send } = useHogWebSocket();

  const onChange = (index: number, delta: number) => {
    send({ type: 'encoder', encoder: index + 1, delta });
  };
  const onStart = (index: number) => {
    send({ type: 'encoder_start', encoder: index + 1 });
  };
  const onEnd = (index: number) => {
    send({ type: 'encoder_end', encoder: index + 1 });
  };

  return { onStart, onChange, onEnd };
};
