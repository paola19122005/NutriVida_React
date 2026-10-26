import { useEffect } from "react";

interface ToastProps {
    mensaje: string;
    visible: boolean;
    onCerrar: () => void;
}

export function Toast({mensaje, visible, onCerrar}: ToastProps){
    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(onCerrar, 2200);
        return () => clearTimeout(timer);
    }, [visible, onCerrar]);

    if(!visible) return null;
    return <div className="toast show">{mensaje}</div>;
}