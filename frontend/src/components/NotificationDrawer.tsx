import React, { useState } from 'react';
import { Bell, AlertTriangle, Activity, CheckCircle, Clock } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectReferral?: (referralId: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  onMarkAllRead,
  onSelectReferral,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title="Live Referral Alerts"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Live Broadcast Alerts
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                No active notifications
              </div>
            ) : (
              notifications.map((notif) => {
                const isHigh = notif.risk_level === 'HIGH RISK' || notif.category === 'HIGH_RISK_REFERRAL';
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.referral_id && onSelectReferral) {
                        onSelectReferral(notif.referral_id);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      !notif.is_read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isHigh ? (
                          <div className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : notif.category === 'VITALS_ALERT' ? (
                          <div className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-lg">
                            <Activity className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
