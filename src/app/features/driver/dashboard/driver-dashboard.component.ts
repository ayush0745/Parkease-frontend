import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PremiumChartComponent, ChartData } from '../../../shared/components/charts/premium-chart.component';
import { StatCardComponent } from '../../../shared/components/stats/stat-card.component';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

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
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 p-6">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Header Section -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div class="space-y-2">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              Welcome back, Driver! 🚗
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Find parking, manage bookings, and track your journey
            </p>
          </div>
          
          <div class="flex space-x-4">
            <button routerLink="/driver/search" class="btn-premium flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>Find Parking</span>
            </button>
            <button routerLink="/driver/bookings" class="btn-premium-outline flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>My Bookings</span>
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
          
          <!-- Active Bookings Section -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Current Bookings -->
            <div class="premium-card p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  🅿️ Active Parking Sessions
                </h2>
                <span class="badge-success">{{ activeBookings.length }} Active</span>
              </div>
              
              <div *ngIf="activeBookings.length === 0" class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Bookings</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">You don't have any active parking sessions</p>
                <button routerLink="/driver/search" class="btn-premium">
                  Find Parking Now
                </button>
              </div>
              
              <div class="space-y-4">
                <div *ngFor="let booking of activeBookings" 
                     class="glass-card p-4 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                        {{ booking.lotName }}
                      </h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Spot {{ booking.spotNumber }} • {{ booking.vehiclePlate }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ booking.startTime | date:'short' }} - {{ booking.endTime | date:'short' }}
                      </p>
                    </div>
                    <span class="badge-info">{{ booking.status }}</span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button *ngIf="booking.status === 'CONFIRMED'" 
                            (click)="checkIn(booking.id)"
                            class="btn-accent text-sm px-4 py-2">
                      Check In
                    </button>
                    <button *ngIf="booking.status === 'CHECKED_IN'" 
                            (click)="checkOut(booking.id)"
                            class="btn-premium text-sm px-4 py-2">
                      Check Out
                    </button>
                    <button (click)="extendBooking(booking.id)" 
                            class="btn-premium-outline text-sm px-4 py-2">
                      Extend
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Booking Analytics -->
            <app-premium-chart
              type="area"
              title="📊 Booking Trends"
              subtitle="Your parking usage over time"
              [data]="bookingTrendsData"
              height="300px"
              [loading]="chartsLoading"
            ></app-premium-chart>
            
          </div>
          
          <!-- Sidebar -->
          <div class="space-y-6">
            
            <!-- Quick Actions -->
            <div class="premium-card p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⚡ Quick Actions
              </h3>
              <div class="space-y-3">
                <button routerLink="/driver/search" 
                        class="w-full flex items-center space-x-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <span class="font-medium">Find Nearby Parking</span>
                </button>
                
                <button routerLink="/driver/vehicles" 
                        class="w-full flex items-center space-x-3 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7"></path>
                  </svg>
                  <span class="font-medium">Manage Vehicles</span>
                </button>
                
                <button routerLink="/driver/payments" 
                        class="w-full flex items-center space-x-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span class="font-medium">Payment History</span>
                </button>
              </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="premium-card p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🕒 Recent Activity
              </h3>
              <div class="space-y-3">
                <div *ngFor="let activity of recentActivity" 
                     class="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                  <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ activity.title }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ activity.time | date:'short' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Spending Chart -->
            <app-premium-chart
              type="donut"
              title="💰 Spending Breakdown"
              subtitle="This month"
              [data]="spendingData"
              height="250px"
              [loading]="chartsLoading"
            ></app-premium-chart>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit {
  private lotService = inject(ParkingLotService);
  private analyticsService = inject(AnalyticsService);

  stats = {
    activeBookings: 2,
    totalBookings: 47,
    vehicles: 3,
    totalSpent: 1245.50
  };

  activeBookings: any[] = [];
  recentActivity: any[] = [];
  statsLoading = false;
  chartsLoading = false;

  bookingTrendsData: ChartData = {
    series: [{
      name: 'Bookings',
      data: [12, 19, 15, 27, 22, 35, 28, 31, 25, 18, 24, 29]
    }],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  spendingData: ChartData = {
    series: [65, 25, 10],
    categories: ['Parking Fees', 'Extensions', 'Penalties']
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.statsLoading = true;
    this.chartsLoading = true;

    // Simulate API loading
    setTimeout(() => {
      this.activeBookings = [
        {
          id: 1,
          lotName: 'Downtown Plaza Premium',
          spotNumber: 'A-15',
          vehiclePlate: 'ABC-123',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          status: 'CHECKED_IN'
        },
        {
          id: 2,
          lotName: 'Tech Hub Parking',
          spotNumber: 'B-08',
          vehiclePlate: 'EV-456',
          startTime: new Date(Date.now() + 1800000),
          endTime: new Date(Date.now() + 5400000),
          status: 'CONFIRMED'
        }
      ];

      this.recentActivity = [
        {
          title: 'Checked out from Mall Parking',
          time: new Date(Date.now() - 3600000)
        },
        {
          title: 'Payment processed - $12.50',
          time: new Date(Date.now() - 7200000)
        },
        {
          title: 'Booking confirmed at Airport Lot',
          time: new Date(Date.now() - 10800000)
        },
        {
          title: 'New vehicle registered - Tesla Model 3',
          time: new Date(Date.now() - 86400000)
        }
      ];

      this.statsLoading = false;
      this.chartsLoading = false;
    }, 1500);
  }

  checkIn(bookingId: number) {
    console.log('Checking in booking:', bookingId);
    // Update booking status
    const booking = this.activeBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'CHECKED_IN';
    }
  }

  checkOut(bookingId: number) {
    console.log('Checking out booking:', bookingId);
    // Remove from active bookings
    this.activeBookings = this.activeBookings.filter(b => b.id !== bookingId);
    this.stats.activeBookings = this.activeBookings.length;
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