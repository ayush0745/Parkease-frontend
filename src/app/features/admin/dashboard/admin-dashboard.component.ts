import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { ToastService } from '../../../shared/services/toast.service';
import { StatCardComponent } from '../../../shared/components/stats/stat-card.component';
import { PremiumChartComponent } from '../../../shared/components/charts/premium-chart.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading/loading-skeleton.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, PremiumChartComponent, LoadingSkeletonComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Header -->
        <div class="glass-card p-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Platform Admin
              </h1>
              <p class="text-gray-600 dark:text-gray-300 mt-2">Manage your parking platform ecosystem</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="glass-badge">
                <span class="text-sm font-medium">{{ getCurrentTime() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-stat-card
            title="Total Users"
            [value]="stats().totalUsers"
            [trend]="12.5"
            icon="👥"
            color="primary"
            [loading]="loading()"
          />
          <app-stat-card
            title="Active Lots"
            [value]="stats().activeLots"
            [trend]="8.2"
            icon="🏢"
            color="success"
            [loading]="loading()"
          />
          <app-stat-card
            title="Total Bookings"
            [value]="stats().totalBookings"
            [trend]="15.3"
            icon="📅"
            color="accent"
            [loading]="loading()"
          />
          <app-stat-card
            title="Platform Revenue"
            [value]="stats().revenue"
            [trend]="22.1"
            icon="💰"
            color="success"
            prefix="$"
            [loading]="loading()"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">User Growth</h3>
            <app-premium-chart
              type="area"
              [data]="userGrowthData"
              height="300"
            />
          </div>
          <div class="glass-card p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Analytics</h3>
            <app-premium-chart
              type="bar"
              [data]="revenueData"
              height="300"
            />
          </div>
        </div>

        <!-- Pending Approvals -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Pending Lot Approvals</h2>
            <div class="glass-badge">
              <span class="text-sm font-medium">{{ pendingLots.length }} pending</span>
            </div>
          </div>
          
          <app-loading-skeleton *ngIf="loading()" type="table" />
          
          <div *ngIf="!loading() && pendingLots.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">✅</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
            <p class="text-gray-600 dark:text-gray-300">No new lots waiting for approval.</p>
          </div>
          
          <div *ngIf="!loading() && pendingLots.length > 0" class="overflow-hidden rounded-xl border border-white/20">
            <table class="w-full">
              <thead class="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lot Details</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Manager</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                <tr *ngFor="let lot of pendingLots; trackBy: trackByLotId" 
                    class="hover:bg-white/5 transition-all duration-200 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {{ lot.name?.charAt(0) || 'P' }}
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {{ lot.name }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ lot.address }}, {{ lot.city }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">#{{ lot.managerId }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ getTimeAgo(lot.createdAt) }}</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end space-x-3">
                      <button 
                        (click)="approveLot(lot.lotId!)"
                        class="btn-success px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105">
                        ✓ Approve
                      </button>
                      <button 
                        (click)="rejectLot(lot.lotId!)"
                        class="btn-danger px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105">
                        ✗ Reject
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
export class AdminDashboardComponent implements OnInit {
  private lotService = inject(ParkingLotService);
  private toastService = inject(ToastService);
  
  pendingLots: any[] = [];
  loading = signal(true);
  stats = signal({
    totalUsers: 0,
    activeLots: 0,
    totalBookings: 0,
    revenue: 0
  });

  userGrowthData = {
    series: [{
      name: 'Users',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 148, 180, 210]
    }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  revenueData = {
    series: [{
      name: 'Revenue',
      data: [2400, 1398, 9800, 3908, 4800, 3800, 4300, 5200, 6100, 7200, 8300, 9400]
    }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading.set(true);
    
    // Simulate loading stats
    setTimeout(() => {
      this.stats.set({
        totalUsers: 1248,
        activeLots: 42,
        totalBookings: 8932,
        revenue: 124500
      });
    }, 800);
    
    this.loadPendingLots();
  }

  loadPendingLots() {
    this.lotService.getPendingLots().subscribe({
      next: (res: any) => {
        this.pendingLots = res.content || res || [];
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading pending lots:', err);
        this.pendingLots = [];
        this.loading.set(false);
        this.toastService.error('Failed to load pending lots');
      }
    });
  }

  approveLot(id: string | number) {
    this.lotService.approveLot(String(id)).subscribe({
      next: () => {
        this.toastService.success('Lot approved successfully!');
        this.loadPendingLots();
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
          this.loadPendingLots();
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
