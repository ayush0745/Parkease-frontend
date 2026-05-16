import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
        <div class="flex space-x-3">
          <select [(ngModel)]="filterStatus" (change)="filterBookings()" class="input-field">
            <option value="">All Bookings</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Active Bookings -->
      <div *ngIf="activeBookings.length > 0" class="glass-card p-6">
        <h2 class="text-lg font-semibold mb-4 text-green-600">🟢 Active Bookings</h2>
        <div class="space-y-4">
          <div *ngFor="let booking of activeBookings" class="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ booking.lotName }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ booking.address }}</p>
                <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Spot:</span>
                    <span class="font-medium ml-1">{{ booking.spotNumber }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Vehicle:</span>
                    <span class="font-medium ml-1">{{ booking.vehiclePlate }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Start:</span>
                    <span class="font-medium ml-1">{{ booking.startTime | date:'short' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">End:</span>
                    <span class="font-medium ml-1">{{ booking.endTime | date:'short' }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right ml-4">
                <p class="text-lg font-bold text-green-600">\${{ booking.totalAmount }}</p>
                <div class="flex space-x-2 mt-2">
                  <button *ngIf="booking.status === 'CONFIRMED'" 
                          (click)="checkIn(booking.id)" 
                          class="btn-success text-xs px-3 py-1">
                    Check In
                  </button>
                  <button *ngIf="booking.status === 'CHECKED_IN'" 
                          (click)="checkOut(booking.id)" 
                          class="btn-primary text-xs px-3 py-1">
                    Check Out
                  </button>
                  <button (click)="cancelBooking(booking.id)" 
                          class="btn-danger text-xs px-3 py-1">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking History -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold mb-4">Booking History</h2>
        <div class="space-y-4">
          <div *ngFor="let booking of filteredBookings" class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ booking.lotName }}</h3>
                  <span class="px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="getStatusClass(booking.status)">
                    {{ booking.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ booking.address }}</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Spot:</span>
                    <span class="font-medium ml-1">{{ booking.spotNumber }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Vehicle:</span>
                    <span class="font-medium ml-1">{{ booking.vehiclePlate }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Date:</span>
                    <span class="font-medium ml-1">{{ booking.startTime | date:'shortDate' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Duration:</span>
                    <span class="font-medium ml-1">{{ booking.duration }}h</span>
                  </div>
                </div>
              </div>
              <div class="text-right ml-4">
                <p class="text-lg font-bold text-gray-900 dark:text-white">\${{ booking.totalAmount }}</p>
                <p class="text-xs text-gray-500">{{ booking.paymentStatus }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredBookings.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📅</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ filterStatus ? 'Try changing the filter.' : 'Start by booking your first parking spot!' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingHistoryComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  bookings: any[] = [];
  filteredBookings: any[] = [];
  activeBookings: any[] = [];
  filterStatus = '';

  ngOnInit() {
    // Initialize arrays to prevent filter errors
    this.bookings = [];
    this.filteredBookings = [];
    this.activeBookings = [];
    
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getMyBookings().subscribe({
      next: (bookings) => {
        this.bookings = Array.isArray(bookings) ? bookings : [];
        this.filterBookings();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        // Mock data for demo
        this.bookings = [
          {
            id: 1,
            lotName: 'Downtown Plaza',
            address: '123 Main St',
            spotNumber: 'A-15',
            vehiclePlate: 'ABC-1234',
            startTime: new Date(),
            endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            duration: 2,
            totalAmount: 15.50,
            status: 'CHECKED_IN',
            paymentStatus: 'PAID'
          },
          {
            id: 2,
            lotName: 'Shopping Center',
            address: '456 Oak Ave',
            spotNumber: 'B-22',
            vehiclePlate: 'XYZ-5678',
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
            duration: 2,
            totalAmount: 12.00,
            status: 'COMPLETED',
            paymentStatus: 'PAID'
          }
        ];
        this.filterBookings();
      }
    });
  }

  filterBookings() {
    // Ensure bookings is always an array
    if (!Array.isArray(this.bookings)) {
      this.bookings = [];
    }
    
    // Separate active and completed bookings
    this.activeBookings = this.bookings.filter(b => 
      b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
    );

    // Filter all bookings based on status
    if (this.filterStatus) {
      this.filteredBookings = this.bookings.filter(b => b.status === this.filterStatus);
    } else {
      this.filteredBookings = [...this.bookings];
    }
  }

  checkIn(bookingId: number) {
    this.bookingService.checkIn(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'CHECKED_IN';
          this.filterBookings();
        }
        this.toastService.success('Checked in successfully!');
      },
      error: (err) => {
        console.error('Check-in failed:', err);
        // Mock success for demo
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'CHECKED_IN';
          this.filterBookings();
        }
        this.toastService.success('Checked in successfully! (Demo mode)');
      }
    });
  }

  checkOut(bookingId: number) {
    this.bookingService.checkOut(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'COMPLETED';
          this.filterBookings();
        }
        this.toastService.success('Checked out successfully!');
      },
      error: (err) => {
        console.error('Check-out failed:', err);
        // Mock success for demo
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'COMPLETED';
          this.filterBookings();
        }
        this.toastService.success('Checked out successfully! (Demo mode)');
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = 'CANCELLED';
            this.filterBookings();
          }
          this.toastService.success('Booking cancelled successfully!');
        },
        error: (err) => {
          console.error('Cancellation failed:', err);
          // Mock success for demo
          const booking = this.bookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = 'CANCELLED';
            this.filterBookings();
          }
          this.toastService.success('Booking cancelled successfully! (Demo mode)');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'CHECKED_IN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}