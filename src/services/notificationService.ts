/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { unifiedStore, ToastNotification, SupplyChainNotification } from './unifiedStore';

class NotificationService {
  public getToastNotifications(): ToastNotification[] {
    return unifiedStore.getNotifications();
  }

  public getSupplyChainNotifications(recipientOrg?: string, recipientRole?: string): SupplyChainNotification[] {
    if (!recipientOrg || !recipientRole) return unifiedStore.getSupplyChainNotifications(recipientOrg || '', recipientRole || '');
    return unifiedStore.getSupplyChainNotifications(recipientOrg, recipientRole);
  }

  public markNotificationRead(notificationId: string): void {
    unifiedStore.markNotificationRead(notificationId);
  }

  public markAllNotificationsRead(recipientOrg?: string, recipientRole?: string): void {
    unifiedStore.markAllNotificationsRead(recipientOrg || '', recipientRole || '');
  }

  public removeToastNotification(id: string): void {
    unifiedStore.removeNotification(id);
  }

  public subscribe(listener: () => void): () => void {
    return unifiedStore.subscribe(listener);
  }
}

export const notificationService = new NotificationService();
