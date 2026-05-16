import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <button routerLink="/manager/lots" class="btn-primary">
          Manage Lots
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card">
          <p class="text-sm font-medium text-gray-500">Total Lots</p>
          <p class="text-3xl font-bold mt-2">{{ stats.totalLots }}</p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-500">Active Bookings</p>
          <p class="text-3xl font-bold mt-2 text-blue-600">{{ stats.activeBookings }}</p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-500">Occupancy Rate</p>
          <p class="text-3xl font-bold mt-2 text-green-600">{{ stats.occupancyRate }}%</p>
        </div>
        <div class="card">
          <p class="text-sm font-medium text-gray-500">Today's Revenue</p>
          <p class="text-3xl font-bold mt-2 text-purple-600">\${{ stats.todayRevenue }}</p>
        </div>
      </div>

      <!-- My Parking Lots -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">My Parking Lots</h2>
          <button routerLink="/manager/lots/create" class="btn-secondary">Add New Lot</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let lot of lots" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ lot.name }}</p>
                    <p class="text-sm text-gray-500">{{ lot.address }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': lot.status === 'APPROVED' && lot.isOpen,
                          'bg-yellow-100 text-yellow-800': lot.status === 'PENDING',
                          'bg-red-100 text-red-800': lot.status === 'REJECTED',
                          'bg-gray-100 text-gray-800': !lot.isOpen
                        }">
                    {{ lot.status === 'APPROVED' ? (lot.isOpen ? 'Open' : 'Closed') : lot.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="lot.occupancyRate"></div>
                    </div>
                    <span class="text-sm text-gray-600">{{ lot.occupiedSpots }}/{{ lot.totalSpots }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium">\${{ lot.todayRevenue }}</p>
                  <p class="text-sm text-gray-500">Today</p>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button (click)="viewLot(lot.id)" class="text-sm text-blue-600 hover:text-blue-800">View</button>
                  <button (click)="editLot(lot.id)" class="text-sm text-green-600 hover:text-green-800">Edit</button>
                  <button *ngIf="lot.status === 'APPROVED'" 
                          (click)="toggleLotStatus(lot.id, lot.isOpen)" 
                          class="text-sm hover:underline"
                          [ngClass]="{
                            'text-red-600': lot.isOpen,
                            'text-green-600': !lot.isOpen
                          }">
                    {{ lot.isOpen ? 'Close' : 'Open' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity & Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Bookings -->
        <div class="card">
          <h2 class="text-lg font-bold mb-4">Recent Bookings</h2>
          <div class="space-y-3">
            <div *ngFor="let booking of recentBookings" class="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p class="font-medium text-gray-900">{{ booking.lotName }}</p>
                <p class="text-sm text-gray-500">{{ booking.vehiclePlate }} • Spot {{ booking.spotNumber }}</p>
                <p class="text-xs text-gray-500">{{ booking.startTime | date:'short' }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">\${{ booking.amount }}</p>
                <span class="text-xs px-2 py-1 rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800': booking.status === 'CHECKED_IN',
                        'bg-blue-100 text-blue-800': booking.status === 'CONFIRMED',
                        'bg-gray-100 text-gray-800': booking.status === 'COMPLETED'
                      }">
                  {{ booking.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card">
          <h2 class="text-lg font-bold mb-4">Performance Metrics</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Average Occupancy</span>
              <span class="font-medium">{{ metrics.avgOccupancy }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Peak Hours</span>
              <span class="font-medium">{{ metrics.peakHours }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Monthly Revenue</span>
              <span class="font-medium">\${{ metrics.monthlyRevenue }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Customer Rating</span>
              <span class="font-medium">{{ metrics.rating }}/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManagerDashboardComponent implements OnInit {
  private lotService = inject(ParkingLotService);
  private analyticsService = inject(AnalyticsService);

  stats = {
    totalLots: 3,
    activeBookings: 12,
    occupancyRate: 78,
    todayRevenue: 245.50
  };

  lots: any[] = [];
  recentBookings: any[] = [];
  metrics = {
    avgOccupancy: 72,
    peakHours: '2-4 PM',
    monthlyRevenue: 3250,
    rating: 4.2
  };

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Mock data - replace with actual API calls
    this.lots = [
      {
        id: 1,
        name: 'Downtown Plaza',
        address: '123 Main St',
        status: 'APPROVED',
        isOpen: true,
        totalSpots: 50,
        occupiedSpots: 35,
        occupancyRate: 70,
        todayRevenue: 125.50
      },
      {
        id: 2,
        name: 'Shopping Center',
        address: '456 Oak Ave',
        status: 'PENDING',
        isOpen: false,
        totalSpots: 100,
        occupiedSpots: 0,
        occupancyRate: 0,
        todayRevenue: 0
      }
    ];

    this.recentBookings = [
      {
        id: 1,
        lotName: 'Downtown Plaza',
        vehiclePlate: 'ABC-123',
        spotNumber: 'A-15',
        startTime: new Date(),
        amount: 15.50,
        status: 'CHECKED_IN'
      }
    ];
  }

  viewLot(lotId: number) {
    console.log('Viewing lot:', lotId);
  }

  editLot(lotId: number) {
    console.log('Editing lot:', lotId);
  }

  toggleLotStatus(lotId: number, currentStatus: boolean) {
    const action = currentStatus ? 'close' : 'open';
    if (confirm(`${action} this parking lot?`)) {
      console.log(`${action} lot:`, lotId);
      this.loadDashboardData();
    }
  }
}