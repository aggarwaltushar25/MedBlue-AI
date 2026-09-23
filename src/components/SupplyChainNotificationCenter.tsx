/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Truck, AlertCircle, Clock, X } from 'lucide-react';
import { SupplyChainNotification, unifiedStore } from '../services/unifiedStore';

interface SupplyChainNotificationCenterProps {
  recipientOrg: string;
  recipientRole: 'Wholesaler' | 'Pharmacist' | 'Manufacturer' | 'Chemist' | 'Client' | 'Regulator' | 'Admin';
  onOpenShipment?: (shipmentId: string, route: string) => void;
}

export const SupplyChainNotificationCenter: React.FC<SupplyChainNotificationCenterProps> = ({
  recipientOrg,
  recipientRole,
  onOpenShipment,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'ACTION_REQUIRED'>('UNREAD');
  const [storeTick, setStoreTick] = useState<number>(0);

  useEffect(() => {
    const unsub = unifiedStore.subscribe(() => setStoreTick((t) => t + 1));
    return () => {
      unsub();
    };
  }, []);

  const notifications = useMemo(() => {
    return unifiedStore.getSupplyChainNotifications(recipientOrg, recipientRole);
  }, [recipientOrg, recipientRole, storeTick]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status === 'CREATED' || n.status === 'DELIVERED').length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'UNREAD') {
      return notifications.filter((n) => n.status !== 'ACTIONED');
    }
    if (filterTab === 'ACTION_REQUIRED') {
      return notifications.filter((n) => n.status === 'CREATED' || n.status === 'READ');
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleNotificationClick = (notif: SupplyChainNotification) => {
    if (notif.status === 'CREATED' || notif.status === 'DELIVERED') {
      unifiedStore.markNotificationRead(notif.notificationId);
    }
    if (onOpenShipment) {
      onOpenShipment(notif.shipmentId, notif.relatedRoute);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    unifiedStore.markAllNotificationsRead(recipientOrg, recipientRole);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center shadow-xs"
        title="Supply-Chain Notifications"
        aria-label="Supply-Chain Notifications"
      >
        <Bell className="w-5 h-5 text-purple-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal / Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Supply-Chain Alerts</h3>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{recipientOrg}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/40 px-3 py-2 gap-2 text-xs">
            <button
              onClick={() => setFilterTab('UNREAD')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                filterTab === 'UNREAD' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab('ACTION_REQUIRED')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                filterTab === 'ACTION_REQUIRED' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Action Required
            </button>
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                filterTab === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-900">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <CheckCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white">No supply-chain notifications</div>
                <p className="text-[11px] text-slate-400">All inbound consignments are received and verified.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isActioned = notif.status === 'ACTIONED';
                return (
                  <div
                    key={notif.notificationId}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-900/80 ${
                      isActioned ? 'opacity-60 bg-slate-950' : 'bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActioned
                              ? 'bg-emerald-500'
                              : notif.priority === 'high'
                              ? 'bg-rose-500 animate-ping'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-white tracking-tight">{notif.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          isActioned
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {notif.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{notif.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-purple-300">Shipment: {notif.shipmentId}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{notif.createdAt}</span>
                      </span>
                    </div>

                    {!isActioned && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Required: Receive & Verify</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                          <span>Open Dock</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-center text-[10px] text-slate-400">
            Real-time supply-chain event sync active • Single source of truth
          </div>
        </div>
      )}
    </div>
  );
};
