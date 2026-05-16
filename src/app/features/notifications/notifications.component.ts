import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
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
             class="glass-card p-4 hover:shadow-md transition-shadow"
             [class.border-l-4]="!notification.read"
             [class.border-blue-500]="!notification.read">
          
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <!-- Icon -->
              <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                   [ngClass]="getNotificationIconClass(notification.type)">
                {{ getNotificationIcon(notification.type) }}
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ notification.title }}</h3>
                  <span *ngIf="!notification.read" 
                        class="w-2 h-2 bg-blue-500 rounded-full"></span>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ notification.message }}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{{ notification.createdAt | date:'medium' }}</span>
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getTypeClass(notification.type)">
                    {{ notification.type }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4">
              <button *ngIf="!notification.read" 
                      (click)="markAsRead(notification.id)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Mark Read
              </button>
              <button (click)="deleteNotification(notification.id)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>

          <!-- Action Button (if applicable) -->
          <div *ngIf="notification.actionUrl" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button (click)="handleNotificationAction(notification)" 
                    class="btn-primary text-sm px-4 py-2">
              {{ notification.actionText || 'View Details' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="notifications.length === 0" class="text-center py-12">
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
  private toastService = inject(ToastService);

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
    this.loading = true;
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        // Mock data for demo
        this.notifications = this.getMockNotifications();
        this.loading = false;
      }
    });
  }

  getMockNotifications(): any[] {
    return [
      {
        id: 1,
        title: 'Booking Confirmed',
        message: 'Your parking spot at Downtown Plaza has been confirmed for today at 2:00 PM.',
        type: 'BOOKING',
        read: false,
        createdAt: new Date(),
        actionUrl: '/driver/bookings',
        actionText: 'View Booking'
      },
      {
        id: 2,
        title: 'Payment Successful',
        message: 'Payment of $15.50 for your parking session has been processed successfully.',
        type: 'PAYMENT',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Parking Session Ending Soon',
        message: 'Your parking session will end in 15 minutes. Consider extending if needed.',
        type: 'REMINDER',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        title: 'Welcome to ParkEase!',
        message: 'Thank you for joining ParkEase. Start by adding your vehicle and finding parking spots.',
        type: 'SYSTEM',
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
        this.toastService.success('Notification marked as read');
      },
      error: (err) => {
        console.error('Failed to mark as read:', err);
        // Mock success for demo
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
        this.toastService.success('Notification marked as read (Demo mode)');
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.toastService.success('All notifications marked as read');
      },
      error: (err) => {
        console.error('Failed to mark all as read:', err);
        // Mock success for demo
        this.notifications.forEach(n => n.read = true);
        this.toastService.success('All notifications marked as read (Demo mode)');
      }
    });
  }

  deleteNotification(notificationId: number) {
    if (confirm('Are you sure you want to delete this notification?')) {
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.toastService.success('Notification deleted');
        },
        error: (err) => {
          console.error('Failed to delete notification:', err);
          // Mock success for demo
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.toastService.success('Notification deleted (Demo mode)');
        }
      });
    }
  }

  handleNotificationAction(notification: any) {
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'BOOKING': return '📅';
      case 'PAYMENT': return '💳';
      case 'REMINDER': return '⏰';
      case 'SYSTEM': return '🔔';
      case 'PROMOTION': return '🎉';
      default: return '📢';
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'BOOKING': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400';
      case 'PAYMENT': return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400';
      case 'REMINDER': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400';
      case 'SYSTEM': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'PROMOTION': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'BOOKING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'PAYMENT': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'REMINDER': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'PROMOTION': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  trackByNotificationId(index: number, notification: any): number {
    return notification.id;
  }
}