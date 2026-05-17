import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-parking-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Find Parking <span class="text-primary-500">🔍</span>
          </h1>
          <p class="text-gray-500 mt-1">Search, compare, and book the best parking spots instantly.</p>
        </div>
      </div>

      <!-- Search Form -->
      <div class="card p-0 overflow-hidden border-primary-100 ring-4 ring-primary-50">
        <form [formGroup]="searchForm" (ngSubmit)="searchParkingLots()" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-end">
            <div class="md:col-span-4">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Where do you want to park?</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <input formControlName="location" class="input-field pl-10 bg-gray-50 border-transparent focus:bg-white" placeholder="Enter city or address">
              </div>
            </div>
            
            <div class="md:col-span-3">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
              <input formControlName="startTime" type="datetime-local" class="input-field bg-gray-50 border-transparent focus:bg-white text-sm">
            </div>
            
            <div class="md:col-span-3">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
              <input formControlName="endTime" type="datetime-local" class="input-field bg-gray-50 border-transparent focus:bg-white text-sm">
            </div>
            
            <div class="md:col-span-2 flex items-end h-full">
              <button type="submit" [disabled]="loading" class="btn-primary w-full h-[42px] shadow-md shadow-primary-500/20">
                <svg *ngIf="!loading" class="w-4.5 h-4.5 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <svg *ngIf="loading" class="animate-spin w-4.5 h-4.5 mr-1.5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ loading ? 'Searching' : 'Search' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div *ngFor="let lot of searchResults" class="card p-0 overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border-gray-100 hover:border-primary-200 hover:shadow-xl">
          <div class="p-6 border-b border-gray-100 bg-gray-50/50">
            <div class="flex justify-between items-start gap-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 line-clamp-1" [title]="lot.name">{{ lot.name }}</h3>
                <p class="text-sm font-medium text-gray-500 mt-1 line-clamp-1">{{ lot.address }}, {{ lot.city }}</p>
                <div class="flex items-center gap-4 mt-3 text-sm font-semibold">
                  <span class="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                    <span class="relative flex h-2 w-2 mr-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {{ lot.availableSpots }} Spots
                  </span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg border border-primary-100 text-center">
                  <p class="text-xl font-extrabold">\${{ lot.hourlyRate || '5.00' }}</p>
                  <p class="text-[10px] font-bold uppercase tracking-wider opacity-80">Per Hour</p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 flex-1 flex flex-col justify-between">
            <div>
              <!-- Amenities -->
              <div *ngIf="lot.amenities?.length > 0" class="mb-5">
                <span class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amenities</span>
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let amenity of lot.amenities" 
                        class="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">
                    {{ amenity }}
                  </span>
                </div>
              </div>

              <!-- Available Spots Grid -->
              <div class="mb-6">
                <span class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Spots</span>
                <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  <button *ngFor="let spot of lot.availableSpotsList" 
                          (click)="selectSpot(lot, spot)"
                          [class]="selectedSpot?.spotId === spot.spotId ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-200 shadow-md transform -translate-y-0.5' : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'"
                          class="aspect-square flex items-center justify-center rounded-lg border text-xs font-black transition-all duration-200 focus:outline-none">
                    {{ spot.spotNumber }}
                  </button>
                  <div *ngIf="!lot.availableSpotsList?.length" class="col-span-full py-4 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No spots available for selected time
                  </div>
                </div>
              </div>
            </div>

            <button (click)="bookSpot(lot)" 
                    [disabled]="!selectedSpot || selectedSpot?.lotId !== lot.lotId"
                    class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-300"
                    [ngClass]="{'shadow-primary-500/30 ring-2 ring-primary-100': selectedSpot && selectedSpot?.lotId === lot.lotId}">
              {{ selectedSpot?.lotId === lot.lotId ? 'Book Spot ' + selectedSpot.spotNumber : 'Select a spot to book' }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="searchResults.length === 0 && !loading" class="lg:col-span-2 card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-5">🗺️</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No parking spots found</h3>
          <p class="text-gray-500 max-w-sm mx-auto">We couldn't find any available parking spots matching your criteria. Try adjusting your location or time window.</p>
        </div>
      </div>

      <!-- Booking Modal -->
      <div *ngIf="showBookingModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
          
          <div class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 class="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <span class="text-primary-500">✅</span> Confirm Booking
            </h3>
            <button (click)="closeBookingModal()" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto space-y-6">
            
            <!-- Summary Card -->
            <div class="bg-primary-50 rounded-xl p-5 border border-primary-100">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h4 class="font-bold text-gray-900 text-lg">{{ selectedLot?.name }}</h4>
                  <p class="text-sm font-medium text-primary-700 mt-0.5">Spot {{ selectedSpot?.spotNumber }}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-black text-primary-700">\${{ calculateTotal() }}</div>
                  <div class="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Total Due</div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-primary-100/50 mt-4">
                <div>
                  <span class="block text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Duration</span>
                  <span class="font-bold text-gray-900">{{ calculateDuration() }} Hours</span>
                </div>
                <div>
                  <span class="block text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Rate</span>
                  <span class="font-bold text-gray-900">\${{ selectedLot?.hourlyRate || '5.00' }} / hr</span>
                </div>
              </div>
            </div>

            <!-- Form Details -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Select Vehicle</label>
                <div class="relative">
                  <select [(ngModel)]="selectedVehicleId" class="input-field pl-10 appearance-none bg-gray-50 border border-gray-200 font-medium">
                    <option value="null" disabled selected>Choose a vehicle</option>
                    <option *ngFor="let vehicle of vehicles" [ngValue]="vehicle.vehicleId">
                      {{ vehicle.licensePlate }} ({{ vehicle.make }} {{ vehicle.model }})
                    </option>
                  </select>
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p *ngIf="vehicles.length === 0" class="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  You need to register a vehicle first to book a spot.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input [formControl]="searchForm.controls.startTime" (change)="cdr.detectChanges()" type="datetime-local" class="input-field bg-gray-50 border-gray-200 text-sm">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1.5">End Time</label>
                  <input [formControl]="searchForm.controls.endTime" (change)="cdr.detectChanges()" type="datetime-local" class="input-field bg-gray-50 border-gray-200 text-sm">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
                <div class="flex gap-3">
                  <label class="flex-1 relative">
                    <input type="radio" name="payment" value="CASH" [(ngModel)]="paymentMethod" class="peer sr-only">
                    <div class="p-3 border-2 rounded-xl cursor-pointer transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 border-gray-200 text-gray-600 hover:bg-gray-50 text-center font-bold text-sm">
                      💵 Pay at Kiosk
                    </div>
                  </label>
                  <label class="flex-1 relative">
                    <input type="radio" name="payment" value="UPI" [(ngModel)]="paymentMethod" class="peer sr-only">
                    <div class="p-3 border-2 rounded-xl cursor-pointer transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 border-gray-200 text-gray-600 hover:bg-gray-50 text-center font-bold text-sm">
                      📱 Pay via UPI
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-5 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
            <button (click)="closeBookingModal()" class="btn-secondary flex-1">Cancel</button>
            <button (click)="confirmBooking()" 
                    [disabled]="!selectedVehicleId || bookingInProgress || vehicles.length === 0"
                    class="btn-primary flex-1 shadow-lg shadow-primary-500/20 disabled:shadow-none">
              <svg *ngIf="bookingInProgress" class="animate-spin w-4.5 h-4.5 mr-1.5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ bookingInProgress ? 'Processing...' : 'Confirm Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParkingSearchComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private lotService = inject(ParkingLotService);
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  private authSubscription?: any;

  searchForm = this.fb.group({
    location: [''],
    startTime: [''],
    endTime: ['']
  });

  searchResults: any[] = [];
  vehicles: any[] = [];
  loading = false;
  showBookingModal = false;
  bookingInProgress = false;
  selectedLot: any = null;
  selectedSpot: any = null;
  selectedVehicleId: number | null = null;
  paymentMethod: string = 'CASH';

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadVehicles();
        this.searchParkingLots();
      }
    });
    this.setDefaultTimes();
  }

  setDefaultTimes() {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    this.searchForm.patchValue({
      startTime: this.formatDateTime(startTime),
      endTime: this.formatDateTime(endTime)
    });
  }

  formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  loadVehicles() {
    this.vehicleService.getMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = Array.isArray(vehicles) ? vehicles : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load vehicles:', err);
        this.vehicles = [];
      }
    });
  }

  searchParkingLots() {
    this.loading = true;
    const { location } = this.searchForm.value;

    const searchAction = location 
      ? this.lotService.getLotsByCity(location) 
      : this.lotService.getLots();

    searchAction.subscribe({
      next: (response) => {
        const rawLots = Array.isArray(response) ? response : (response.content || []);
        // Only show approved lots
        this.searchResults = rawLots.filter((lot: any) => lot.isApproved);
        
        // Fetch available spots for each lot based on selected time window
        const startTime = this.searchForm.get('startTime')?.value;
        const endTime = this.searchForm.get('endTime')?.value;

        this.searchResults.forEach(lot => {
          if (startTime && endTime) {
            this.bookingService.getAvailableSpotsForTime(lot.lotId, startTime, endTime).subscribe({
              next: (spots) => {
                const spotList = Array.isArray(spots) ? spots : [];
                lot.availableSpotsList = spotList;
                lot.availableSpots = spotList.length;
                this.cdr.detectChanges();
              },
              error: () => {
                lot.availableSpotsList = [];
                lot.availableSpots = 0;
              }
            });
          } else {
            // Fallback to current availability if times not set
            this.lotService.getAvailableSpots(lot.lotId.toString()).subscribe({
              next: (spots) => {
                const spotList = Array.isArray(spots) ? spots : [];
                lot.availableSpotsList = spotList;
                lot.availableSpots = spotList.length;
                this.cdr.detectChanges();
              }
            });
          }
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search failed:', err);
        this.toastService.error('Failed to load parking lots');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


  selectSpot(lot: any, spot: any) {
    this.selectedLot = lot;
    this.selectedSpot = spot;
  }

  bookSpot(lot: any) {
    if (!this.selectedSpot || this.selectedSpot.lotId !== lot.lotId) {
      this.toastService.error('Please select a spot first');
      return;
    }

    this.showBookingModal = true;
  }

  calculateDuration(): number {
    const { startTime, endTime } = this.searchForm.value;
    if (!startTime || !endTime) return 0;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  calculateTotal(): number {
    if (!this.selectedLot) return 0;
    const rate = this.selectedLot.hourlyRate || 5;
    return this.calculateDuration() * rate;
  }

  confirmBooking() {
    if (!this.selectedVehicleId || !this.selectedSpot) {
      this.toastService.error('Please select a vehicle and spot');
      return;
    }

    const { startTime, endTime } = this.searchForm.value;
    if (!startTime || !endTime) {
      this.toastService.error('Please select start and end times');
      return;
    }

    // Find the selected vehicle to get its plate and type
    const selectedVehicle = this.vehicles.find((v: any) => v.vehicleId === this.selectedVehicleId);
    if (!selectedVehicle) {
      this.toastService.error('Selected vehicle not found');
      return;
    }

    this.bookingInProgress = true;
    this.cdr.detectChanges();
    
    // Build request matching backend CreateBookingRequest
    const bookingRequest = {
      lotId: Number(this.selectedSpot.lotId),
      spotId: Number(this.selectedSpot.spotId),
      vehiclePlate: selectedVehicle.licensePlate,
      vehicleType: selectedVehicle.vehicleType || 'FOUR_WHEELER',
      bookingType: 'PRE',
      startTime: startTime,
      endTime: endTime,
      paymentMethod: this.paymentMethod
    };

    console.log('Booking request:', bookingRequest);

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (booking) => {
        this.toastService.success('Booking confirmed successfully!');
        this.closeBookingModal();
        this.searchParkingLots(); // Refresh to update spot availability
      },
      error: (err) => {
        console.error('Booking failed:', err);
        this.toastService.error(err.error?.message || 'Booking failed. Please try again.');
        this.bookingInProgress = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedLot = null;
    this.selectedSpot = null;
    this.selectedVehicleId = null;
    this.bookingInProgress = false;
    this.cdr.detectChanges(); // Force change detection
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}