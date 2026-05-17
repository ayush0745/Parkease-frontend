import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';
import { StatCardComponent } from '../../../shared/components/stats/stat-card.component';
import { PremiumChartComponent } from '../../../shared/components/charts/premium-chart.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading/loading-skeleton.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, PremiumChartComponent, LoadingSkeletonComponent],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Platform Admin <span class="text-blue-600">🛡️</span>
          </h1>
          <p class="text-gray-500 mt-1">Manage your parking platform ecosystem and approvals.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-600">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ getCurrentTime() }}
          </div>
          <button (click)="loadDashboardData()" class="btn-secondary whitespace-nowrap">
            <svg class="w-4.5 h-4.5 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refresh Data
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card
          label="Total Users"
          [value]="stats().totalUsers"
          icon="users"
          color="primary"
          [loading]="loading()"
        ></app-stat-card>
        <app-stat-card
          label="Active Lots"
          [value]="stats().activeLots"
          icon="parking"
          color="success"
          [loading]="loading()"
        ></app-stat-card>
        <app-stat-card
          label="Total Bookings"
          [value]="stats().totalBookings"
          icon="booking"
          color="accent"
          [loading]="loading()"
        ></app-stat-card>
        <app-stat-card
          label="Platform Revenue"
          [value]="stats().revenue"
          icon="money"
          color="warning"
          prefix="$"
          [loading]="loading()"
        ></app-stat-card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">👥</span>
            Users by Role
          </h3>
          <app-premium-chart
            type="bar"
            [data]="userRoleData"
            height="300px"
          ></app-premium-chart>
        </div>
        <div class="card p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">💰</span>
            Revenue Analytics
          </h3>
          <app-premium-chart
            type="area"
            [data]="revenueData"
            height="300px"
          ></app-premium-chart>
        </div>
      </div>

      <!-- Platform Stats Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">Platform Summary</h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                Drivers
              </div>
              <span class="font-bold text-gray-900">{{ stats().totalDrivers }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div>
                Managers
              </div>
              <span class="font-bold text-gray-900">{{ stats().totalManagers }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                Pending Approvals
              </div>
              <span class="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{{ pendingLots.length }}</span>
            </div>
          </div>
        </div>

        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">Booking Status</h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div> Active Bookings
              </div>
              <span class="font-bold text-gray-900">{{ stats().activeBookings }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-green-500"></div> Completed
              </div>
              <span class="font-bold text-gray-900">{{ stats().completedBookings }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <div class="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-red-500"></div> Cancelled
              </div>
              <span class="font-bold text-gray-900">{{ stats().cancelledBookings }}</span>
            </div>
            <div class="pt-2 mt-2 border-t border-gray-100">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Completion Rate</span>
                <span class="text-sm font-bold text-primary-600">{{ stats().completionRate }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="bg-primary-500 h-1.5 rounded-full" [style.width.%]="stats().completionRate"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-0 overflow-hidden">
          <div class="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">Revenue Breakdown</h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex justify-between items-center py-1">
              <span class="text-sm font-medium text-gray-600">Total Revenue</span>
              <span class="font-bold text-green-600">\${{ stats().revenue.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-sm font-medium text-gray-600">This Month</span>
              <span class="font-bold text-gray-900">\${{ stats().monthlyRevenue.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center py-1">
              <span class="text-sm font-medium text-gray-600">Avg per Booking</span>
              <span class="font-bold text-gray-900">\${{ stats().avgRevenuePerBooking.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center py-1 pt-3 border-t border-gray-100">
              <span class="text-sm font-medium text-gray-600">Revenue Sources</span>
              <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{{ stats().activeLots }} active lots</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Approvals -->
      <div class="card p-0 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">⏳</span>
            Pending Lot Approvals
          </h2>
          <span class="badge-warning" *ngIf="pendingLots.length > 0">{{ pendingLots.length }} Pending</span>
        </div>
        
        <div class="p-6">
          <app-loading-skeleton *ngIf="loading()" type="table"></app-loading-skeleton>
          
          <div *ngIf="!loading() && pendingLots.length === 0" class="text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-1">All caught up!</h3>
            <p class="text-gray-500">No new parking lots are waiting for your approval.</p>
          </div>
          
          <div *ngIf="!loading() && pendingLots.length > 0" class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Lot Details</th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Manager ID</th>
                  <th class="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let lot of pendingLots; trackBy: trackByLotId" class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                        {{ lot.name?.charAt(0) || 'P' }}
                      </div>
                      <div>
                        <p class="font-bold text-gray-900">{{ lot.name }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ lot.address }}, {{ lot.city }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                        M
                      </div>
                      <span class="text-sm font-semibold text-gray-700">#{{ lot.managerId }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm font-medium text-gray-600">{{ getTimeAgo(lot.createdAt) }}</span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="approveLot(lot.lotId!)" class="btn-primary py-1.5 px-3 text-xs">
                        Approve
                      </button>
                      <button (click)="rejectLot(lot.lotId!)" class="btn-secondary py-1.5 px-3 text-xs text-red-600 hover:border-red-200 hover:bg-red-50">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private lotService = inject(ParkingLotService);
  private authService = inject(AuthService);
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  private authSubscription?: any;
  private routerSubscription?: any;
  private dataSubscription?: any;
  
  pendingLots: any[] = [];
  allLots: any[] = [];
  loading = signal(true);
  
  // Track active requests to manage loading state
  private activeRequests = 0;

  stats = signal({
    totalUsers: 0,
    totalDrivers: 0,
    totalManagers: 0,
    activeLots: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    completionRate: 0,
    revenue: 0,
    monthlyRevenue: 0,
    avgRevenuePerBooking: 0
  });

  userRoleData: any = {
    series: [{ name: 'Users', data: [] }],
    categories: []
  };

  revenueData: any = {
    series: [{ name: 'Revenue ($)', data: [] }],
    categories: []
  };

  ngOnInit() {
    // 1. Load immediately if we already have a user
    if (this.authService.currentUserValue) {
      this.loadDashboardData();
    }

    // 2. Also subscribe to currentUser$ for any subsequent changes (like after login)
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadDashboardData();
      }
    });

    // 3. Robust router subscription
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.includes('/admin/dashboard') || url.includes('/dashboard')) {
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  loadDashboardData() {
    this.loading.set(true);
    this.activeRequests = 4; // Drivers, Managers, Admins, Lots

    const decrementRequest = () => {
      this.activeRequests--;
      if (this.activeRequests <= 0) {
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    };

    // 1. Fetch Users
    this.authService.getUsersByRole('DRIVER').pipe(catchError(() => of([]))).subscribe(drivers => {
      this.stats.update(s => ({ ...s, totalDrivers: drivers.length }));
      this.updateUserRoleChart();
      decrementRequest();
    });

    this.authService.getUsersByRole('MANAGER').pipe(catchError(() => of([]))).subscribe(managers => {
      this.stats.update(s => ({ ...s, totalManagers: managers.length }));
      this.updateUserRoleChart();
      decrementRequest();
    });

    this.authService.getUsersByRole('ADMIN').pipe(catchError(() => of([]))).subscribe(admins => {
      // Just for total count
      this.updateUserRoleChart();
      decrementRequest();
    });

    // 2. Fetch Lots & Pending
    this.lotService.getLots().pipe(catchError(() => of({ content: [] }))).subscribe(lots => {
      this.allLots = Array.isArray(lots) ? lots : (lots?.content || []);
      const approvedLots = this.allLots.filter((l: any) => l.isApproved === true);
      this.stats.update(s => ({ ...s, activeLots: approvedLots.length }));
      
      // Load bookings for approved lots
      if (approvedLots.length > 0) {
        this.loadBookingsData(approvedLots);
      } else {
        this.loading.set(false);
      }
      decrementRequest();
    });

    this.lotService.getPendingLots().pipe(catchError(() => of({ content: [] }))).subscribe(pending => {
      this.pendingLots = Array.isArray(pending) ? pending : (pending?.content || []);
      this.cdr.detectChanges();
    });
  }

  private updateUserRoleChart() {
    const s = this.stats();
    const total = s.totalDrivers + s.totalManagers + (this.allLots.length > 0 ? 1 : 0); // rough estimate
    this.stats.update(curr => ({ ...curr, totalUsers: s.totalDrivers + s.totalManagers }));
    
    this.userRoleData = {
      series: [{ name: 'Count', data: [s.totalDrivers, s.totalManagers, 1] }],
      categories: ['Drivers', 'Managers', 'Admins']
    };
    this.cdr.detectChanges();
  }

  private loadBookingsData(approvedLots: any[]) {
    const bookingRequests = approvedLots.map((lot: any) =>
      this.bookingService.getLotBookings(lot.lotId).pipe(catchError(() => of({ content: [] })))
    );

    forkJoin(bookingRequests).subscribe({
      next: (bookingResults: any[]) => {
        let allBookings: any[] = [];
        bookingResults.forEach((result: any) => {
          const list = Array.isArray(result) ? result : (result?.content || []);
          allBookings = allBookings.concat(list);
        });

        const now = new Date();
        const activeBookings = allBookings.filter((b: any) => b.status === 'ACTIVE' || b.status === 'RESERVED');
        const completedBookings = allBookings.filter((b: any) => b.status === 'COMPLETED');
        const cancelledBookings = allBookings.filter((b: any) => b.status === 'CANCELLED');
        const nonCancelled = allBookings.filter((b: any) => b.status !== 'CANCELLED');
        const completionRate = nonCancelled.length > 0
          ? Math.round((completedBookings.length / nonCancelled.length) * 100)
          : 0;

        const totalRevenue = nonCancelled.reduce((sum: number, b: any) => sum + (b.totalAmount || b.amount || 0), 0);

        const currentMonthBookings = nonCancelled.filter((b: any) => {
          if (!b.startTime && !b.createdAt) return false;
          const d = new Date(b.startTime || b.createdAt);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        const monthlyRevenue = currentMonthBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || b.amount || 0), 0);
        const avgPerBooking = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0;

        // Build revenue chart
        const monthlyMap: { [key: string]: number } = {};
        completedBookings.forEach((b: any) => {
          const d = new Date(b.startTime || b.createdAt);
          if (!isNaN(d.getTime())) {
            const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyMap[key] = (monthlyMap[key] || 0) + (b.totalAmount || b.amount || 0);
          }
        });
        const sortedMonths = Object.keys(monthlyMap).sort((a, b) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime());
        this.revenueData = {
          series: [{ name: 'Revenue ($)', data: sortedMonths.map(m => parseFloat(monthlyMap[m].toFixed(2))) }],
          categories: sortedMonths.length > 0 ? sortedMonths : ['No Data']
        };

        this.stats.update(s => ({
          ...s,
          totalBookings: allBookings.length,
          activeBookings: activeBookings.length,
          completedBookings: completedBookings.length,
          cancelledBookings: cancelledBookings.length,
          completionRate,
          revenue: totalRevenue,
          monthlyRevenue,
          avgRevenuePerBooking: avgPerBooking
        }));

        this.cdr.detectChanges();
      }
    });
  }

  approveLot(id: string | number) {
    this.lotService.approveLot(String(id)).subscribe({
      next: () => {
        this.toastService.success('Lot approved successfully!');
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error approving lot:', err);
        this.toastService.error('Failed to approve lot. Please try again.');
      }
    });
  }

  rejectLot(id: string | number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.lotService.rejectLot(String(id), reason).subscribe({
        next: () => {
          this.toastService.success('Lot rejected successfully!');
          this.loadDashboardData();
        },
        error: (err) => {
          console.error('Error rejecting lot:', err);
          this.toastService.error('Failed to reject lot. Please try again.');
        }
      });
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  getTimeAgo(date: string | Date): string {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently';
  }

  trackByLotId(index: number, lot: any): any {
    return lot.lotId || index;
  }
}
