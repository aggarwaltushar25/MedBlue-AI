/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  ShieldAlert,
  AlertTriangle,
  CheckCheck,
  Filter,
  Search,
  Building2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { SupplyChainNotification } from '../services/unifiedStore';
import { notificationService } from '../services/notificationService';
import { AppNavTab } from './Header';

interface NotificationsViewProps {
  onOpenShipment?: (shipmentId: string) => void;
  onOpenBatch?: (batchId: string) => void;
  setActiveTab: (tab: AppNavTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onOpenShipment,
  onOpenBatch,
  setActiveTab,
}) => {
  const [notifications, setNotifications] = useState<SupplyChainNotification[]>([]);
  const [storeTick, setStoreTick] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const update = () => {
      setNotifications(notificationService.getSupplyChainNotifications());
    };
    update();
    const unsubscribe = notificationService.subscribe(() => {
      setStoreTick((t) => t + 1);
      update();
    });
    return () => {
      unsubscribe();
    };
  }, [storeTick]);

  const handleMarkRead = (id: string) => {
    notificationService.markNotificationRead(id);
    setNotifications(notificationService.getSupplyChainNotifications());
  };

  const handleMarkAllRead = () => {
    notificationService.markAllNotificationsRead();
    setNotifications(notificationService.getSupplyChainNotifications());
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    notifications.forEach((n) => set.add(n.type));
    return ['ALL', ...Array.from(set)];
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesCategory = selectedCategory === 'ALL' || n.type === selectedCategory;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNREAD' && n.status !== 'READ' && n.status !== 'ACTIONED') ||
        (statusFilter === 'ACTIONED' && n.status === 'ACTIONED');
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.recipientOrg.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [notifications, selectedCategory, statusFilter, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const map: Record<string, SupplyChainNotification[]> = {};
    filteredNotifications.forEach((n) => {
      const cat = n.type;
      if (!map[cat]) map[cat] = [];
      map[cat].push(n);
    });
    return map;
  }, [filteredNotifications]);

  const formatCategoryName = (type: string) => {
    switch (type) {
      case 'NEW_SHIPMENT':
        return 'New Consignment Dispatches';
      case 'SHIPMENT_RECEIVED':
        return 'Consignment Receipts';
      case 'QUARANTINE':
        return 'Quarantine & Hold';
      case 'RECALL':
        return 'Regulatory Recalls';
      case 'COLD_CHAIN_ALERT':
        return 'Cold Chain Deviations';
      case 'DUPLICATE_SERIAL':
        return 'Duplicate Serial Alerts';
      case 'HOLOGRAM_VERIFICATION':
        return 'Hologram / OVD Verification';
      case 'REGULATORY_ALERT':
        return 'Regulatory Compliance Alerts';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">High Priority</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Normal</span>;
    }
  };

  const handleOpenEntity = (n: SupplyChainNotification) => {
    if (n.shipmentId && onOpenShipment) {
      onOpenShipment(n.shipmentId);
    } else if (n.batchId && onOpenBatch) {
      onOpenBatch(n.batchId);
    } else if (n.relatedRoute === 'wholesaler' || n.relatedRoute === 'pharmacist') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('blockchain');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">Supply Chain Notification Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {notifications.filter((n) => n.status !== 'READ' && n.status !== 'ACTIONED').length} Unread
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time audit alerts, shipment dispatches, cold chain notifications, and regulatory action requirements across manufacturing, wholesale, and pharmacy nodes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-indigo-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, shipment, batch, org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['ALL', 'UNREAD', 'ACTIONED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.filter((c) => c !== 'ALL').map((cat) => (
              <option key={cat} value={cat}>
                {formatCategoryName(cat)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List Grouped by Category */}
      {Object.keys(groupedByCategory).length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-base font-bold font-display text-white">No Notifications Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            There are no active notifications matching your selected filters or search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([categoryType, notifs]) => (
            <div key={categoryType} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold font-display uppercase tracking-wider text-indigo-400">
                    {formatCategoryName(categoryType)}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {notifs.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notifs.map((notif) => {
                  const isUnread = notif.status !== 'READ' && notif.status !== 'ACTIONED';
                  const isActioned = notif.status === 'ACTIONED';

                  return (
                    <div
                      key={notif.notificationId}
                      className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all relative overflow-hidden ${
                        isUnread
                          ? 'border-indigo-500/50 bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 shadow-indigo-950/30'
                          : 'border-slate-800/80 opacity-90'
                      }`}
                    >
                      {isUnread && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none blur-xl" />
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold font-display text-white">{notif.title}</h3>
                              {getPriorityBadge(notif.priority)}
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              )}
                              {isActioned && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Action Completed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 font-semibold text-slate-300">
                                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                {notif.recipientOrg}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {notif.createdAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                        {/* Shipment & Batch Tags */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                          <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800/60">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Shipment Ref</span>
                            <span className="font-mono font-bold text-indigo-300">{notif.shipmentId}</span>
                          </div>
                          <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800/60">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Batch Number</span>
                            <span className="font-mono font-bold text-emerald-300">{notif.batchId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                        <div className="text-[10px] text-slate-400">
                          Source: <strong className="text-slate-300">{notif.sourceOrg}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkRead(notif.notificationId)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark Read</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEntity(notif)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-950/50 transition-all cursor-pointer"
                          >
                            <span>Open Entity</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
