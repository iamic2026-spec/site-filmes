'use client';

import React from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

interface ToastNotificationProps {
  toast: {
    id: number;
    text: string;
    type: 'success' | 'info' | 'error';
  } | null;
}

export function ToastNotification({ toast }: ToastNotificationProps) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#12121A]/95 backdrop-blur-xl px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.9),0_0_20px_rgba(244,63,94,0.3)] transition-all animate-in fade-in slide-in-from-bottom-5">
      {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-[#F43F5E] shrink-0" />}
      {toast.type === 'info' && <Info className="h-5 w-5 text-[#38BDF8] shrink-0" />}
      {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />}

      <p className="text-xs sm:text-sm font-medium text-white max-w-sm">
        {toast.text}
      </p>
    </div>
  );
}
