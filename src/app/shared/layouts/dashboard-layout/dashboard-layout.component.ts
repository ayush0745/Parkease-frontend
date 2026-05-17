import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen" style="background: #f8fafc; display: flex;">

      <!-- ── Sidebar ─────────────────────────────── -->
      <aside style="
        position: fixed; inset-y: 0; left: 0; z-index: 50;
        width: 256px; height: 100vh;
        background: #ffffff;
        border-right: 1px solid rgba(148,163,184,0.14);
        box-shadow: 4px 0 24px rgba(15,23,42,0.05);
        display: flex; flex-direction: column;
      ">

        <!-- Logo -->
        <div style="
          padding: 0 1.25rem;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(148,163,184,0.12);
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
        ">
          <div style="
            width:34px; height:34px;
            background: rgba(255,255,255,0.18);
            border: 1.5px solid rgba(255,255,255,0.3);
            border-radius: 9px;
            display:flex; align-items:center; justify-content:center;
          ">
            <span style="color:white; font-size:17px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-1px;">P</span>
          </div>
          <span style="font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:1.15rem; color:white; letter-spacing:-0.03em;">ParkEase</span>
        </div>

        <!-- Role Label -->
        <div style="padding: 1.25rem 1.25rem 0.5rem;">
          <span style="font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8;">
            {{ currentUser?.role }} PORTAL
          </span>
        </div>

        <!-- Navigation -->
        <nav style="flex:1; padding: 0.25rem 0.875rem; overflow-y:auto;">

          <ng-container [ngSwitch]="currentUser?.role">

            <!-- Driver Nav -->
            <ng-container *ngSwitchCase="'DRIVER'">
              <a routerLink="/driver/dashboard" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-4.5 h-4.5 w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Dashboard
              </a>
              <a routerLink="/driver/search" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Find Parking
              </a>
              <a routerLink="/driver/bookings" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                My Bookings
              </a>
              <a routerLink="/driver/vehicles" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7"/>
                </svg>
                My Vehicles
              </a>
              <a routerLink="/driver/payments" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                Payments
              </a>
            </ng-container>

            <!-- Manager Nav -->
            <ng-container *ngSwitchCase="'MANAGER'">
              <a routerLink="/manager/dashboard" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Dashboard
              </a>
              <a routerLink="/manager/lots" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                My Lots
              </a>
              <a routerLink="/manager/bookings" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Bookings
              </a>
              <a routerLink="/manager/analytics" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Analytics
              </a>
            </ng-container>

            <!-- Admin Nav -->
            <ng-container *ngSwitchCase="'ADMIN'">
              <a routerLink="/admin/dashboard" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Dashboard
              </a>
              <a routerLink="/admin/users" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1"/>
                </svg>
                Users
              </a>
              <a routerLink="/admin/approvals" routerLinkActive="sidebar-item-active"
                 class="sidebar-item" style="gap:0.75rem;">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Approvals
              </a>
            </ng-container>

          </ng-container>

          <!-- Divider -->
          <div style="height:1px; background: rgba(148,163,184,0.14); margin: 0.75rem 0.5rem;"></div>

          <!-- Common Nav -->
          <a [routerLink]="['./profile']" routerLinkActive="sidebar-item-active"
             class="sidebar-item" style="gap:0.75rem;">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Profile Settings
          </a>

          <a [routerLink]="['./notifications']" routerLinkActive="sidebar-item-active"
             class="sidebar-item" style="gap:0.75rem; justify-content: space-between;">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              Notifications
            </div>
            <span *ngIf="unreadCount > 0"
                  style="background: #ef4444; color:white; font-size:0.65rem; font-weight:700; padding: 1px 6px; border-radius:999px; min-width:18px; text-align:center;">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </a>

        </nav>

        <!-- ── User Section ───────────────────────── -->
        <div style="
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(148,163,184,0.14);
          background: #fafafa;
        ">
          <div class="flex items-center gap-3 mb-3">
            <!-- Avatar -->
            <div style="
              width:36px; height:36px;
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              border-radius:50%;
              display:flex; align-items:center; justify-content:center;
              color:white; font-weight:700; font-size:0.875rem;
              flex-shrink:0;
            ">
              {{ currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U' }}
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p style="font-size:0.875rem; font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                {{ currentUser?.fullName || currentUser?.email }}
              </p>
              <p style="font-size:0.72rem; color:#94a3b8; font-weight:500;">{{ currentUser?.role }}</p>
            </div>
            <!-- Theme toggle -->
            <app-theme-toggle />
          </div>

          <!-- Sign Out -->
          <button (click)="logout()"
                  class="w-full flex items-center gap-2.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                  style="padding: 0.5rem 0.625rem; border-radius:8px; border:none; background:transparent; cursor:pointer; width:100%;"
                  onmouseover="this.style.background='#fef2f2'; this.style.color='#dc2626';"
                  onmouseout="this.style.background='transparent'; this.style.color='#64748b';">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign out
          </button>

        </div>
      </aside>

      <!-- ── Main Content ───────────────────────────── -->
      <div style="margin-left: 256px; flex:1; min-width:0;">
        <main style="padding: 1.75rem 2rem; min-height:100vh;">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `

})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  unreadCount = 0;

  constructor() {
    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
    this.loadUnreadCount();
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  loadUnreadCount() {
    if (this.currentUser) {
      this.notificationService.getUnreadCount(this.currentUser.id).subscribe({
        next: (count) => this.notificationService.updateUnreadCount(count),
        error: () => this.notificationService.updateUnreadCount(0)
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}