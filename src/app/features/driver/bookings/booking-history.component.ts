import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            {{ isManager ? 'Lot Bookings' : 'My Bookings' }} <span class="text-blue-500">📋</span>
          </h1>
          <p class="text-gray-500 mt-1">Review and manage your parking sessions.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <select [(ngModel)]="filterStatus" (change)="filterBookings()" class="input-field pl-10 pr-10 py-2.5 bg-white shadow-sm font-medium text-gray-700 appearance-none">
              <option value="">All Bookings</option>
              <option value="RESERVED">Reserved</option>
              <option value="ACTIVE">Active (Checked In)</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            </div>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Bookings -->
      <div *ngIf="activeBookings.length > 0" class="card p-0 overflow-hidden border-green-200 ring-4 ring-green-50">
        <div class="p-5 border-b border-green-100 bg-green-50/50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-green-800 flex items-center gap-2">
            <span class="relative flex h-3 w-3 mr-1">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Active Sessions
          </h2>
          <span class="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md">{{ activeBookings.length }} Active</span>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div *ngFor="let booking of activeBookings" class="flex flex-col lg:flex-row justify-between lg:items-center p-5 rounded-xl border border-gray-100 hover:border-green-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
              <div class="mb-4 lg:mb-0">
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="font-bold text-gray-900 text-lg">{{ booking.lotName }}</h3>
                  <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        [ngClass]="booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                    {{ booking.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-3">{{ booking.address }}</p>
                
                <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg inline-flex">
                  <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>Spot {{ booking.spotNumber }}</span>
                  <div class="w-px h-4 bg-gray-300"></div>
                  <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>{{ booking.vehiclePlate }}</span>
                  <div class="w-px h-4 bg-gray-300"></div>
                  <span class="flex items-center gap-1.5 text-gray-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{{ booking.startTime | date:'MMM d, h:mm a' }}</span>
                </div>
              </div>
              
              <div class="flex flex-col items-end gap-3">
                <div class="text-right flex items-center gap-3">
                  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</div>
                  <p class="text-2xl font-extrabold text-green-600">\${{ booking.totalAmount }}</p>
                </div>
                
                <div class="flex flex-wrap items-center justify-end gap-2 w-full">
                  <button *ngIf="booking.status === 'RESERVED'" 
                          (click)="checkIn(booking.bookingId || booking.id)" 
                          class="btn-accent px-4 py-2 w-full sm:w-auto">
                    Check In Now
                  </button>
                  
                  <div *ngIf="booking.status === 'ACTIVE'" class="flex items-center gap-2 w-full sm:w-auto">
                    <div class="relative w-full sm:w-auto">
                      <select [(ngModel)]="checkoutPaymentMethod" class="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2">
                        <option value="CASH">💵 Cash</option>
                        <option value="UPI">📱 UPI / QR</option>
                        <option value="CARD">💳 Debit/Credit Card</option>
                        <option value="WALLET">👛 Digital Wallet</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <button (click)="checkOut(booking.bookingId || booking.id)" 
                            class="btn-primary px-5 py-2 whitespace-nowrap">
                      Check Out
                    </button>
                  </div>
                  
                  <button *ngIf="booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'"
                          (click)="cancelBooking(booking.bookingId || booking.id)" 
                          class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 px-4 py-2 w-full sm:w-auto">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking History List -->
      <div class="card p-0 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center text-sm">🕰️</span>
            Booking History
          </h2>
          <span class="text-sm font-semibold text-gray-500">{{ filteredBookings.length }} Records</span>
        </div>
        
        <div class="p-2">
          <!-- Empty State -->
          <div *ngIf="filteredBookings.length === 0" class="text-center py-16">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl shadow-sm mb-5 mx-auto border border-gray-100">📅</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p class="text-gray-500 max-w-sm mx-auto">{{ filterStatus ? 'Try changing your filter criteria above.' : 'You haven\\'t made any parking bookings yet.' }}</p>
          </div>

          <div class="space-y-1">
            <div *ngFor="let booking of filteredBookings" class="group flex flex-col sm:flex-row justify-between sm:items-center p-4 hover:bg-gray-50 transition-colors rounded-xl">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors flex-shrink-0">
                  {{ booking.lotName.charAt(0) }}
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-gray-900">{{ booking.lotName }}</h3>
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                          [ngClass]="getStatusClass(booking.status)">
                      {{ booking.status }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mb-2">{{ booking.address }}</p>
                  
                  <div class="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                    <span class="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md"><svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>{{ booking.spotNumber }}</span>
                    <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>{{ booking.vehiclePlate }}</span>
                    <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{{ booking.startTime | date:'MMM d, yyyy' }}</span>
                    <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{{ booking.duration }}h</span>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 sm:mt-0 text-right flex flex-col items-end pl-16 sm:pl-0">
                <p class="text-xl font-extrabold text-gray-900">\${{ booking.totalAmount }}</p>
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{{ booking.paymentStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookingHistoryComponent implements OnInit, OnDestroy {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private lotService = inject(ParkingLotService);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);

  bookings: any[] = [];
  filteredBookings: any[] = [];
  activeBookings: any[] = [];
  filterStatus = '';
  checkoutPaymentMethod: string = 'CASH';
  isManager = false;
  private authSubscription?: any;

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isManager = user.role === 'MANAGER';
        this.loadBookings();
      }
    });

    // Initialize arrays to prevent filter errors
    this.bookings = [];
    this.filteredBookings = [];
    this.activeBookings = [];
  }

  loadBookings() {
    const user = this.authService.currentUserValue;
    if (!user) return;

    if (this.isManager) {
      this.lotService.getManagerLots(user.id).subscribe({
        next: (lotsResponse) => {
          const lots = Array.isArray(lotsResponse) ? lotsResponse : (lotsResponse.content || []);
          if (lots.length === 0) {
            this.bookings = [];
            this.filterBookings();
            return;
          }

          const bookingRequests = lots.map((lot: any) => 
            this.bookingService.getLotBookings(lot.lotId)
          );

          forkJoin(bookingRequests).subscribe({
            next: (results: any) => {
              const allBookings: any[] = [];
              results.forEach((res: any) => {
                const list = Array.isArray(res) ? res : (res.content || res || []);
                allBookings.push(...list);
              });

              this.bookings = allBookings.map((b: any) => {
                const start = new Date(b.startTime);
                const end = new Date(b.endTime || b.startTime);
                const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
                
                return {
                  ...b,
                  duration: b.duration || duration,
                  spotNumber: b.spotNumber || `Spot ${b.spotId}`,
                  lotName: b.lotName || `Lot #${b.lotId}`
                };
              });

              this.filterBookings();
            },
            error: (err) => {
              console.error('Failed to load manager lot bookings:', err);
              this.toastService.error('Failed to load bookings');
            }
          });
        },
        error: (err) => {
          console.error('Failed to load manager lots:', err);
          this.toastService.error('Failed to load parking lots');
        }
      });
    } else {
      this.bookingService.getMyBookings().subscribe({
        next: (response) => {
          const rawBookings = Array.isArray(response) ? response : (response?.content || []);
          
          this.bookings = rawBookings.map((b: any) => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime || b.startTime);
            const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
            
            return {
              ...b,
              duration: b.duration || duration,
              spotNumber: b.spotNumber || `Spot ${b.spotId}`,
              lotName: b.lotName || `Lot #${b.lotId}`
            };
          });

          this.filterBookings();
        },
        error: (err) => {
          console.error('Failed to load bookings:', err);
          this.toastService.error('Failed to load bookings. Please try again.');
          this.bookings = [];
          this.filterBookings();
        }
      });
    }
  }

  filterBookings() {
    // Ensure bookings is always an array
    if (!Array.isArray(this.bookings)) {
      this.bookings = [];
    }
    
    // Separate active and completed bookings
    this.activeBookings = this.bookings.filter(b => 
      b.status === 'RESERVED' || b.status === 'ACTIVE'
    );

    // Filter all bookings based on status
    if (this.filterStatus) {
      this.filteredBookings = this.bookings.filter(b => b.status === this.filterStatus);
    } else {
      this.filteredBookings = [...this.bookings];
    }
    this.cdr.detectChanges();
  }

  checkIn(bookingId: number) {
    this.bookingService.checkIn(bookingId).subscribe({
      next: () => {
        const booking = this.bookings.find(b => (b.bookingId || b.id) === bookingId);
        if (booking) {
          booking.status = 'ACTIVE';
          this.filterBookings();
        }
        this.toastService.success('Checked in successfully!');
      },
      error: (err) => {
        console.error('Check-in failed:', err);
        const errorMsg = err.error?.message || 'Check-in failed. The spot might be occupied.';
        this.toastService.error(errorMsg);
        this.loadBookings(); // Refresh to get correct state
      }
    });
  }

  checkOut(bookingId: number) {
    if (this.checkoutPaymentMethod === 'CASH') {
      this.processCheckOut(bookingId, 'CASH');
    } else {
      // For UPI, CARD, WALLET — use Razorpay
      this.handleRazorpayPayment(bookingId);
    }
  }

  private handleRazorpayPayment(bookingId: number) {
    const booking = this.bookings.find(b => (b.bookingId || b.id) === bookingId);
    if (!booking) return;

    // First call checkout to get the Order ID from backend
    this.bookingService.checkOut(bookingId, this.checkoutPaymentMethod).subscribe({
      next: (checkoutResponse: any) => {
        // Wait a small bit for payment service to finish processing if it's async (though here it's sync via feign)
        // Then fetch the payment details to get the transactionId (Razorpay Order ID)
        this.paymentService.getByBooking(bookingId).subscribe({
          next: (payment: any) => {
            const options = {
              key: environment.razorpayKey || 'rzp_test_SmXLLXzt0TRU4N',
              amount: booking.totalAmount * 100, // paise
              currency: 'INR',
              name: 'ParkEase',
              description: `Parking Payment for ${booking.lotName}`,
              order_id: payment.transactionId,
              handler: (res: any) => {
                this.toastService.success('Payment successful!');
                booking.status = 'COMPLETED';
                this.filterBookings();
              },
              modal: {
                ondismiss: () => {
                  this.toastService.warning('Payment modal closed. Please complete payment.');
                  // Keep status as ACTIVE so they can try again
                  booking.status = 'ACTIVE';
                  this.filterBookings();
                }
              },
              prefill: {
                name: this.authService.currentUserValue?.fullName || '',
                email: this.authService.currentUserValue?.email || ''
              },
              theme: {
                color: '#4F46E5'
              }
            };

            const rzp = new Razorpay(options);
            rzp.open();
          },
          error: (err) => {
            console.error('Failed to fetch payment details:', err);
            this.toastService.error('Failed to verify payment status. Please contact support.');
            this.loadBookings();
          }
        });
      },
      error: (err) => {
        console.error('Failed to initiate online payment:', err);
        this.toastService.error('Failed to initiate payment');
      }
    });
  }

  private processCheckOut(bookingId: number, method: string) {
    this.bookingService.checkOut(bookingId, method).subscribe({
      next: () => {
        const booking = this.bookings.find(b => (b.bookingId || b.id) === bookingId);
        if (booking) {
          booking.status = 'COMPLETED';
          this.filterBookings();
        }
        this.toastService.success('Checked out successfully!');
      },
      error: (err) => {
        console.error('Check-out failed:', err);
        this.toastService.error('Check-out failed');
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          const booking = this.bookings.find(b => (b.bookingId || b.id) === bookingId);
          if (booking) {
            booking.status = 'CANCELLED';
            this.filterBookings();
          }
          this.toastService.success('Booking cancelled successfully!');
        },
        error: (err) => {
          console.error('Cancellation failed:', err);
          this.toastService.error('Failed to cancel booking. It might already be active.');
          this.loadBookings();
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}