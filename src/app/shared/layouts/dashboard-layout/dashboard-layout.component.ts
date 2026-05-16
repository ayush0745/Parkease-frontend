import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="flex items-center justify-center h-16 px-4 bg-blue-600">
            <h1 class="text-xl font-bold text-white">🅿️ ParkEase</h1>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-4 py-6 space-y-2">
            <ng-container [ngSwitch]="currentUser?.role">
              <!-- Driver Navigation -->
              <ng-container *ngSwitchCase="'DRIVER'">
                <a routerLink="/driver/dashboard" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50" 
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📊 Dashboard
                </a>
                <a routerLink="/driver/search" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  🔍 Find Parking
                </a>
                <a routerLink="/driver/bookings" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📅 My Bookings
                </a>
                <a routerLink="/driver/vehicles" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  🚗 My Vehicles
                </a>
                <a routerLink="/driver/payments" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  💳 Payments
                </a>
              </ng-container>

              <!-- Manager Navigation -->
              <ng-container *ngSwitchCase="'MANAGER'">
                <a routerLink="/manager/dashboard" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📊 Dashboard
                </a>
                <a routerLink="/manager/lots" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  🏢 My Lots
                </a>
                <a routerLink="/manager/bookings" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📅 Bookings
                </a>
                <a routerLink="/manager/analytics" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📈 Analytics
                </a>
              </ng-container>

              <!-- Admin Navigation -->
              <ng-container *ngSwitchCase="'ADMIN'">
                <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  📊 Dashboard
                </a>
                <a routerLink="/admin/users" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  👥 Users
                </a>
                <a routerLink="/admin/approvals" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
                   class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  ✅ Approvals
                </a>
              </ng-container>
            </ng-container>

            <!-- Common Navigation -->
            <a routerLink="/notifications" routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/50"
               class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              🔔 Notifications
            </a>
          </nav>

          <!-- User Menu -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {{ currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ currentUser?.fullName || currentUser?.email }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ currentUser?.role }}</p>
                </div>
              </div>
              <app-theme-toggle />
            </div>
            <button (click)="logout()" 
                    class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="ml-64">
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentUser() {
    return this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
  }
}