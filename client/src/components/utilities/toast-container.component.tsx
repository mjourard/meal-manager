import React, {useState, useCallback} from "react";
import Toasts, { type IconBackgroundClass } from "./toasts.component";


export type Toast = {
    title: string;
    message: string;
    iconBg: IconBackgroundClass;
    createTime: number;
}
/**
 * @Singleton
 * If this needs to be used in multiple places on the page, need to expose it to services in a different manner
 */
const removalTimeInMS = 1000 * 120;
const ToastContainer: React.FC = () => {

    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "createTime">) => {
        setToasts((prevToasts: Toast[]) => [...prevToasts, {
            ...toast,
            createTime: Date.now()
        }]);
    }, []);

    const toastCanBeRemoved = useCallback((toast: Toast) => {
        // Your logic to determine if a toast can be removed
        return Date.now() - toast.createTime > removalTimeInMS;
    }, []);

    const filterToasts = useCallback(() => {
        setToasts((prevToasts) => prevToasts.filter(toastCanBeRemoved));
    }, [toastCanBeRemoved]);

    return (
        <div aria-live="polite" aria-atomic="true" className="position-relative">
            <div className="toast-container position-absolute top-0 end-0 p-3">
                {toasts.map((toast, index) => (
                    <Toasts
                        key={index}
                        title={toast.title}
                        message={toast.message}
                        iconBg={toast.iconBg}
                    />
                ))}
            </div>
        </div>
    );
}

export default ToastContainer;