/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
} from 'lucide-react';
import { ToastNotification, unifiedStore } from '../services/unifiedStore';

export const ToastNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(unifiedStore.getNotifications());
    };
    updateNotifs();
    const unsubscribe = unifiedStore.subscribe(updateNotifs);
    return () => {
      unsubscribe();
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-2xl shadow-xl border pointer-events-auto flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            notif.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/40 text-white'
              : notif.type === 'warning'
              ? 'bg-slate-900/95 border-amber-500/40 text-white'
              : notif.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/40 text-white'
              : 'bg-slate-900/95 border-blue-500/40 text-white'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {notif.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
            {notif.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-display text-white">{notif.title}</h4>
              <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
          </div>

          <button
            onClick={() => unifiedStore.removeNotification(notif.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
