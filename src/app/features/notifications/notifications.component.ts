import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <div class="flex space-x-3">
          <button (click)="markAllAsRead()" 
                  [disabled]="unreadCount === 0"
                  class="btn-secondary disabled:opacity-50">
            Mark All Read
          </button>
          <button (click)="loadNotifications()" class="btn-primary">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Notification Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ notifications.length }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ unreadCount }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Unread</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ readCount }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Read</div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="space-y-3">
        <div *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
             class="glass-card p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
             [class.border-l-4]="!notification.read"
             [class.border-blue-500]="!notification.read && !isLotApprovalNotification(notification)"
             [class.border-orange-500]="!notification.read && isLotApprovalNotification(notification)"
             (click)="onNotificationClick(notification)">
          
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <!-- Icon -->
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                   [ngClass]="getNotificationIconClass(notification)">
                {{ getNotificationIcon(notification) }}
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ notification.title }}</h3>
                  <span *ngIf="!notification.read" 
                        class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <!-- Lot Approval Badge -->
                  <span *ngIf="isLotApprovalNotification(notification)"
                        class="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 text-xs font-bold rounded-full">
                    ACTION REQUIRED
                  </span>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ notification.message }}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{{ notification.sentAt | date:'medium' }}</span>
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getTypeClass(notification.type)">
                    {{ notification.relatedType === 'LOT' ? 'LOT APPROVAL' : notification.type }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4" (click)="$event.stopPropagation()">
              <button *ngIf="!notification.read" 
                      (click)="markAsRead(notification.id)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
                Mark Read
              </button>
              <button (click)="deleteNotification(notification.id)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>

          <!-- Lot Approval Action Button -->
          <div *ngIf="isLotApprovalNotification(notification)"
               class="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800/40 flex items-center justify-between"
               (click)="$event.stopPropagation()">
            <div class="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
              <span>🏢</span>
              <span class="font-medium">A manager submitted a lot for your review</span>
            </div>
            <button (click)="goToApprovals(notification)"
                    class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-lg shadow transition-all duration-200 hover:scale-105 hover:shadow-md">
              <span>✅</span>
              <span>Review Approval</span>
            </button>
          </div>

          <!-- Generic Action Button (non-lot notifications with actionUrl) -->
          <div *ngIf="notification.actionUrl && !isLotApprovalNotification(notification)"
               class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
               (click)="$event.stopPropagation()">
            <button (click)="handleNotificationAction(notification)" 
                    class="btn-primary text-sm px-4 py-2">
              {{ notification.actionText || 'View Details' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && notifications.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🔔</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p class="text-gray-600 dark:text-gray-400">You're all caught up! New notifications will appear here.</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  notifications: any[] = [];
  loading = false;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get readCount(): number {
    return this.notifications.filter(n => n.read).length;
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    const user = this.authService.currentUserValue;
    if (!user) return;
    
    this.loading = true;
    this.notificationService.getByRecipient(user.id).subscribe({
      next: (response) => {
        const rawNotifications = Array.isArray(response) ? response : (response.content || []);
        this.notifications = rawNotifications.map((n: any) => ({
          ...n,
          id: n.notificationId,
          read: n.isRead
        }));
        this.notificationService.updateUnreadCount(this.unreadCount);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.notifications = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Detect if this notification is a lot-approval request for admins */
  isLotApprovalNotification(notification: any): boolean {
    if (notification.relatedType === 'LOT') return true;
    const title: string = (notification.title || '').toLowerCase();
    const message: string = (notification.message || '').toLowerCase();
    return title.includes('pending approval') || title.includes('lot pending') ||
           message.includes('submitted') && (message.includes('lot') || message.includes('parking lot'));
  }

  /** Click on the whole card: mark as read + navigate if lot approval */
  onNotificationClick(notification: any) {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
    if (this.isLotApprovalNotification(notification) && this.authService.currentUserValue?.role === 'ADMIN') {
      this.router.navigate(['/admin/approvals']);
    }
  }

  /** Dedicated "Review Approval" button click */
  goToApprovals(notification: any) {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
    this.router.navigate(['/admin/approvals']);
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          this.notificationService.updateUnreadCount(this.unreadCount);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // Optimistic update even on error
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          this.notificationService.updateUnreadCount(this.unreadCount);
        }
        this.cdr.detectChanges();
      }
    });
  }

  markAllAsRead() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    this.notificationService.markAllAsRead(user.id).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.notificationService.updateUnreadCount(0);
        this.toastService.success('All notifications marked as read');
        this.cdr.detectChanges();
      },
      error: () => {
        this.notifications.forEach(n => n.read = true);
        this.notificationService.updateUnreadCount(0);
        this.toastService.success('All notifications marked as read');
        this.cdr.detectChanges();
      }
    });
  }

  deleteNotification(notificationId: number) {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.notificationService.updateUnreadCount(this.unreadCount);
          this.toastService.success('Notification deleted');
          this.cdr.detectChanges();
        },
        error: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.notificationService.updateUnreadCount(this.unreadCount);
          this.toastService.success('Notification deleted');
          this.cdr.detectChanges();
        }
      });
    }
  }

  handleNotificationAction(notification: any) {
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  getNotificationIcon(notification: any): string {
    if (this.isLotApprovalNotification(notification)) return '🏢';
    switch (notification.type) {
      case 'BOOKING': return '📅';
      case 'CHECKIN': return '🚗';
      case 'CHECKOUT': return '🏁';
      case 'PAYMENT': return '💳';
      case 'EXPIRY': return '⏰';
      case 'REMINDER': return '⏰';
      case 'SYSTEM': return '🔔';
      case 'PROMO': return '🎉';
      default: return '📢';
    }
  }

  getNotificationIconClass(notification: any): string {
    if (this.isLotApprovalNotification(notification))
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400';
    switch (notification.type) {
      case 'BOOKING': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
      case 'CHECKIN': return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400';
      case 'CHECKOUT': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400';
      case 'PAYMENT': return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400';
      case 'EXPIRY': return 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400';
      case 'REMINDER': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400';
      case 'SYSTEM': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'PROMO': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'BOOKING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'CHECKIN': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'CHECKOUT': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      case 'PAYMENT': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'EXPIRY': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'REMINDER': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'PROMO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  trackByNotificationId(index: number, notification: any): number {
    return notification.id;
  }
}