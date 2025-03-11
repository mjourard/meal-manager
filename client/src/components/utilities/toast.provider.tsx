import React, { createContext, useContext, useRef } from "react";
import { Toast } from "bootstrap";

// Create a context
const ToastContext = createContext<{ showToast: () => void } | null>(null);

// Singleton Toast Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const myRef = useRef<HTMLDivElement | null>(null);

    const showToast = () => {
        if (myRef.current) {
            const myToast = Toast.getOrCreateInstance(myRef.current);
            myToast.show();
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container position-fixed bottom-0 end-0 p-3">
                <div ref={myRef} className="toast" role="alert" data-bs-autohide="true">
                    <div className="toast-header">
                        <strong className="me-auto">Notification</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div className="toast-body">Hello, World!</div>
                </div>
            </div>
        </ToastContext.Provider>
    );
};

// Hook to use the toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
