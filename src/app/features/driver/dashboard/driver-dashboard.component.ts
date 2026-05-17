import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { PremiumChartComponent, ChartData } from '../../../shared/components/charts/premium-chart.component';
import { StatCardComponent } from '../../../shared/components/stats/stat-card.component';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PremiumChartComponent, 
    StatCardComponent
  ],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, Driver! <span class="inline-block animate-bounce-in" style="transform-origin: bottom center;">🚗</span>
          </h1>
          <p class="text-gray-500 mt-1">Find parking, manage bookings, and track your journey.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button routerLink="/driver/bookings" class="btn-secondary">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            My Bookings
          </button>
          <button routerLink="/driver/search" class="btn-primary shadow-lg shadow-primary-500/20">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Find Parking
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card
          label="Active Bookings"
          [value]="stats.activeBookings"
          icon="booking"
          color="primary"
          [trend]="12"
          description="Currently active parking sessions"
          [loading]="statsLoading"
        ></app-stat-card>
        
        <app-stat-card
          label="Total Bookings"
          [value]="stats.totalBookings"
          icon="chart"
          color="accent"
          [trend]="8"
          description="All-time parking bookings"
          [loading]="statsLoading"
        ></app-stat-card>
        
        <app-stat-card
          label="Vehicles"
          [value]="stats.vehicles"
          icon="car"
          color="success"
          description="Registered vehicles"
          [loading]="statsLoading"
        ></app-stat-card>
        
        <app-stat-card
          label="Total Spent"
          [value]="stats.totalSpent"
          prefix="$"
          icon="money"
          color="warning"
          [trend]="-5"
          description="Lifetime parking expenses"
          [loading]="statsLoading"
        ></app-stat-card>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Active Bookings & Charts -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Current Bookings -->
          <div class="card p-0 overflow-hidden">
            <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-sm">🅿️</span>
                Active Parking Sessions
              </h2>
              <span class="badge-success">{{ activeBookings.length }} Active</span>
            </div>
            
            <div class="p-6">
              <div *ngIf="activeBookings.length === 0" class="text-center py-10">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">No Active Bookings</h3>
                <p class="text-gray-500 mb-6 text-sm">You don't have any active parking sessions right now.</p>
                <button routerLink="/driver/search" class="btn-primary">
                  Find Parking Now
                </button>
              </div>
              
              <div class="space-y-4">
                <div *ngFor="let booking of activeBookings" 
                     class="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-primary-100 bg-white hover:shadow-md transition-all duration-300">
                  <div class="mb-4 sm:mb-0">
                    <div class="flex items-center gap-3 mb-1">
                      <h3 class="font-bold text-gray-900">{{ booking.lotName }}</h3>
                      <span class="badge-info text-[10px] uppercase tracking-wider">{{ booking.status }}</span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>Spot {{ booking.spotNumber }}</span>
                      <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>{{ booking.vehiclePlate }}</span>
                    </div>
                    <p class="text-xs font-medium text-gray-400 mt-2">
                      {{ booking.startTime | date:'MMM d, h:mm a' }} — {{ booking.endTime | date:'MMM d, h:mm a' }}
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button *ngIf="booking.status === 'CONFIRMED'" 
                            (click)="checkIn(booking.id)"
                            class="btn-accent text-sm">
                      Check In
                    </button>
                    <button *ngIf="booking.status === 'CHECKED_IN'" 
                            (click)="checkOut(booking.id)"
                            class="btn-primary text-sm">
                      Check Out
                    </button>
                    <button (click)="extendBooking(booking.id)" 
                            class="btn-secondary text-sm">
                      Extend
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Booking Analytics -->
          <div class="card p-6">
            <app-premium-chart
              type="area"
              title="Booking Trends"
              subtitle="Your parking usage over the last year"
              [data]="bookingTrendsData"
              height="300px"
              [loading]="chartsLoading"
            ></app-premium-chart>
          </div>
          
        </div>
        
        <!-- Sidebar Content -->
        <div class="space-y-8">
          
          <!-- Quick Actions -->
          <div class="card p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span class="text-yellow-500">⚡</span> Quick Actions
            </h3>
            <div class="space-y-3">
              <button routerLink="/driver/search" 
                      class="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-all text-gray-700 font-semibold text-sm text-left group">
                <div class="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-200 group-hover:border-primary-100 transition-colors">
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                Find Nearby Parking
              </button>
              
              <button routerLink="/driver/vehicles" 
                      class="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 transition-all text-gray-700 font-semibold text-sm text-left group">
                <div class="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-200 group-hover:border-accent-100 transition-colors">
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7"></path></svg>
                </div>
                Manage Vehicles
              </button>
              
              <button routerLink="/driver/payments" 
                      class="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700 transition-all text-gray-700 font-semibold text-sm text-left group">
                <div class="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center border border-gray-200 group-hover:border-yellow-100 transition-colors">
                  <svg class="w-4 h-4 text-gray-500 group-hover:text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                Payment History
              </button>
            </div>
          </div>
          
          <!-- Spending Chart -->
          <div class="card p-6">
            <app-premium-chart
              type="donut"
              title="Spending Breakdown"
              subtitle="By Parking Lot"
              [data]="spendingData"
              height="250px"
              [loading]="chartsLoading"
            ></app-premium-chart>
          </div>

          <!-- Recent Activity -->
          <div class="card p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span class="text-primary-500">🕒</span> Recent Activity
            </h3>
            <div class="space-y-4">
              <div *ngIf="recentActivity.length === 0" class="text-sm text-gray-500 text-center py-2">No recent activity</div>
              <div *ngFor="let activity of recentActivity" 
                   class="flex gap-3">
                <div class="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0 relative">
                   <div class="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-25"></div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 leading-tight">
                    {{ activity.title }}
                  </p>
                  <p class="text-xs font-medium text-gray-400 mt-1">
                    {{ activity.time | date:'MMM d, y, h:mm a' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  private lotService = inject(ParkingLotService);
  private analyticsService = inject(AnalyticsService);
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private routerSubscription?: any;
  private authSubscription?: any;
  private dataSubscription?: any;

  stats = {
    activeBookings: 0,
    totalBookings: 0,
    vehicles: 0,
    totalSpent: 0
  };

  activeBookings: any[] = [];
  recentActivity: any[] = [];
  statsLoading = false;
  chartsLoading = false;

  bookingTrendsData: ChartData = {
    series: [{
      name: 'Bookings',
      data: []
    }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  spendingData: ChartData = {
    series: [],
    categories: []
  };

  ngOnInit() {
    // Subscribe to currentUser$ so that as soon as login completes or updates, dashboard loads instantly
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        setTimeout(() => this.loadDashboardData(), 50);
      }
    });

    // Listen to route navigation to refresh if clicked on tab (handles same-route navigations)
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: any) => event.urlAfterRedirects === '/driver/dashboard' || event.url === '/driver/dashboard')
    ).subscribe(() => {
      setTimeout(() => {
        this.loadDashboardData();
      }, 50);
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
    const user = this.authService.currentUserValue;
    if (!user) return;

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.statsLoading = true;
    this.chartsLoading = true;

    this.dataSubscription = forkJoin({
      bookings: this.bookingService.getMyBookings(),
      history: this.bookingService.getBookingHistory(),
      vehicles: this.vehicleService.getMyVehicles()
    }).subscribe({
      next: (data) => {
        const allBookings = Array.isArray(data.bookings) ? data.bookings : (data.bookings.content || []);
        const history = Array.isArray(data.history) ? data.history : (data.history.content || []);
        const vehicles = Array.isArray(data.vehicles) ? data.vehicles : (data.vehicles.content || []);

        this.activeBookings = allBookings.filter((b: any) => 
          b.status === 'RESERVED' || b.status === 'ACTIVE' || b.status === 'CHECKED_IN' || b.status === 'CONFIRMED'
        );

        this.recentActivity = history.slice(0, 5).map((h: any) => ({
          title: `${h.status.replace('_', ' ')} at ${h.lotName || 'Parking Lot'}`,
          time: h.updatedAt || h.createdAt
        }));

        this.stats = {
          activeBookings: this.activeBookings.length,
          totalBookings: history.length + this.activeBookings.length,
          vehicles: vehicles.length,
          totalSpent: history.reduce((acc: number, h: any) => acc + (h.totalAmount || 0), 0)
        };

        // Dynamically compute monthly trends from live database data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const counts = new Array(12).fill(0);
        const allUserBookings = [...this.activeBookings, ...history];
        allUserBookings.forEach((b: any) => {
          const dateStr = b.createdAt || b.startTime;
          if (dateStr) {
            const date = new Date(dateStr);
            const monthIndex = date.getMonth();
            if (monthIndex >= 0 && monthIndex < 12) {
              counts[monthIndex]++;
            }
          }
        });

        this.bookingTrendsData = {
          series: [{
            name: 'Bookings',
            data: counts
          }],
          categories: months
        };

        // Dynamically group payments spent by parking lot name
        const spendByLot: { [lot: string]: number } = {};
        history.forEach((h: any) => {
          const lot = h.lotName || 'Other Lots';
          const amount = h.totalAmount || 0;
          spendByLot[lot] = (spendByLot[lot] || 0) + amount;
        });

        const lotNames = Object.keys(spendByLot);
        const lotSpends = lotNames.map(name => Math.round(spendByLot[name] * 100) / 100);

        this.spendingData = {
          series: lotSpends.length > 0 ? lotSpends : [0],
          categories: lotNames.length > 0 ? lotNames : ['No Spend']
        };

        this.statsLoading = false;
        this.chartsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load driver dashboard data:', err);
        this.toastService.error('Failed to load dashboard data');
        this.statsLoading = false;
        this.chartsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkIn(bookingId: number) {
    this.bookingService.checkIn(bookingId).subscribe({
      next: () => {
        this.toastService.success('Checked in successfully!');
        this.loadDashboardData();
      },
      error: (err) => this.toastService.error('Failed to check in')
    });
  }

  checkOut(bookingId: number) {
    this.bookingService.checkOut(bookingId).subscribe({
      next: () => {
        this.toastService.success('Checked out successfully!');
        this.loadDashboardData();
      },
      error: (err) => this.toastService.error('Failed to check out')
    });
  }

  extendBooking(bookingId: number) {
    const hours = prompt('Extend by how many hours?');
    if (hours && !isNaN(Number(hours))) {
      console.log('Extending booking:', bookingId, 'by', hours, 'hours');
      const booking = this.activeBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.endTime = new Date(booking.endTime.getTime() + (Number(hours) * 3600000));
        booking.status = 'EXTENDED';
      }
    }
  }
}