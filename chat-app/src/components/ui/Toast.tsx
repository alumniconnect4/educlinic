import React, { useEffect } from 'react';
import { CheckCircle2, Link } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onDismiss,
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-[9999] transition-all duration-300 ease-out ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3 bg-foreground text-background pl-4 pr-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-sm font-medium whitespace-nowrap">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-400/20 shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
};
