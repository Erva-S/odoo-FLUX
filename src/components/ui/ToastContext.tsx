"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value = {
    toast: addToast,
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container in bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto bg-neoWhite text-neoBlack border-2 border-black rounded-[10px] shadow-neo p-4 flex items-center justify-between gap-3 transform transition-all duration-300 ease-out animate-slide-in"
            )}
          >
            <div className="flex items-center gap-3">
              {t.type === "error" ? (
                <div className="w-6 h-6 rounded-full bg-statusRed flex items-center justify-center border-2 border-black shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 text-black" />
                </div>
              ) : t.type === "info" ? (
                <div className="w-6 h-6 rounded-full bg-neoSage flex items-center justify-center border-2 border-black shrink-0">
                  <Info className="w-3.5 h-3.5 text-black" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-statusGreen flex items-center justify-center border-2 border-black shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                </div>
              )}
              <span className="font-bold text-sm tracking-tight">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-black hover:opacity-70 p-1 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
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

