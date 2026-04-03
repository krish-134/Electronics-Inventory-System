import { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastInput } from './components/Toast';

interface ToastContextType {
    showToast: (content: ToastInput) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toastContent, setToastContent] = useState<ToastInput>();
    const [toastOpen, setToastOpen] = useState<boolean>(false);

    const showToast = (content: ToastInput) => {
        setToastContent(content);
        setToastOpen(true);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast open={toastOpen} setOpen={setToastOpen} content={toastContent} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};