import { PropsWithChildren, useRef } from "react";
import classNames from "classnames";
import { useHogWebSocket } from "../hooks/useHogWebSocket";
import styles from "./HogButton.module.css";

interface HogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    buttonKey: string;
}

export const HogButton: React.FC<HogButtonProps> = ({
    children,
    buttonKey,
    className,
    ...props
}) => {
    const { send } = useHogWebSocket()

    const isPressed = useRef(false);

    const start = (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isPressed.current) return;
        isPressed.current = true;

        send({
            type: 'button_start',
            key: buttonKey
        });
    };

    const end = (e?: React.PointerEvent<HTMLButtonElement>) => {
        if (!isPressed.current) return;
        isPressed.current = false;

        send({
            type: 'button_end',
            key: buttonKey
        });
    };

    return (
        <button
            {...props}
            className={classNames(styles.btn, className)}
            onPointerDown={start}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
        >
            {children}
        </button>
    );
};