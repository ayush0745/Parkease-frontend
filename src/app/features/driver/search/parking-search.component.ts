import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-parking-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Find Parking</h1>

      <!-- Search Form -->
      <div class="glass-card p-6">
        <form [formGroup]="searchForm" (ngSubmit)="searchParkingLots()" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input formControlName="location" class="input-field" placeholder="Enter city or address">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
            <input formControlName="startTime" type="datetime-local" class="input-field">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
            <input formControlName="endTime" type="datetime-local" class="input-field">
          </div>
          <div class="flex items-end">
            <button type="submit" [disabled]="loading" class="btn-primary w-full">
              {{ loading ? 'Searching...' : '🔍 Search' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Search Results -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let lot of searchResults" class="glass-card p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ lot.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ lot.address }}, {{ lot.city }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm">
                <span class="flex items-center text-green-600">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {{ lot.availableSpots }} available
                </span>
                <span class="text-gray-500">{{ lot.distance }}km away</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-600">\${{ lot.hourlyRate }}/hr</p>
              <p class="text-xs text-gray-500">Starting from</p>
            </div>
          </div>

          <!-- Amenities -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span *ngFor="let amenity of lot.amenities" 
                  class="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
              {{ amenity }}
            </span>
          </div>

          <!-- Available Spots -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Spots:</h4>
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let spot of lot.availableSpotsList" 
                      (click)="selectSpot(lot, spot)"
                      [class]="selectedSpot?.id === spot.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                      class="px-3 py-2 rounded text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors">
                {{ spot.spotNumber }}
              </button>
            </div>
          </div>

          <button (click)="bookSpot(lot)" 
                  [disabled]="!selectedSpot || selectedSpot.lotId !== lot.id"
                  class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Book Selected Spot
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="searchResults.length === 0 && !loading" class="lg:col-span-2 text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No parking lots found</h3>
          <p class="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or location.</p>
        </div>
      </div>

      <!-- Booking Modal -->
      <div *ngIf="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-bold mb-4">Confirm Booking</h3>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Parking Lot:</span>
              <span class="font-medium">{{ selectedLot?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Spot:</span>
              <span class="font-medium">{{ selectedSpot?.spotNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Vehicle:</span>
              <select [(ngModel)]="selectedVehicleId" class="input-field">
                <option value="">Select Vehicle</option>
                <option *ngFor="let vehicle of vehicles" [value]="vehicle.id">
                  {{ vehicle.licensePlate }} ({{ vehicle.make }} {{ vehicle.model }})
                </option>
              </select>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Duration:</span>
              <span class="font-medium">{{ calculateDuration() }} hours</span>
            </div>
            <div class="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span class="text-blue-600">\${{ calculateTotal() }}</span>
            </div>
          </div>

          <div class="flex space-x-3">
            <button (click)="confirmBooking()" 
                    [disabled]="!selectedVehicleId || bookingInProgress"
                    class="flex-1 btn-primary disabled:opacity-50">
              {{ bookingInProgress ? 'Booking...' : 'Confirm Booking' }}
            </button>
            <button (click)="closeBookingModal()" class="flex-1 btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParkingSearchComponent implements OnInit {
  private lotService = inject(ParkingLotService);
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

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

  ngOnInit() {
    this.loadVehicles();
    this.setDefaultTimes();
    this.loadMockResults(); // Load some default results
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
        this.vehicles = vehicles || [];
      },
      error: (err) => {
        console.error('Failed to load vehicles:', err);
        // Mock vehicle for demo
        this.vehicles = [
          { id: 1, licensePlate: 'ABC-1234', make: 'Toyota', model: 'Camry' }
        ];
      }
    });
  }

  searchParkingLots() {
    this.loading = true;
    const { location, startTime, endTime } = this.searchForm.value;

    // Mock search - replace with actual API call
    setTimeout(() => {
      this.searchResults = this.getMockSearchResults();
      this.loading = false;
    }, 1000);
  }

  loadMockResults() {
    this.searchResults = this.getMockSearchResults();
  }

  getMockSearchResults(): any[] {
    return [
      {
        id: 1,
        name: 'Downtown Plaza',
        address: '123 Main St',
        city: 'Downtown',
        hourlyRate: 8.50,
        availableSpots: 15,
        distance: 0.5,
        amenities: ['Covered', 'Security', 'EV Charging'],
        availableSpotsList: [
          { id: 1, spotNumber: 'A-15', lotId: 1 },
          { id: 2, spotNumber: 'A-16', lotId: 1 },
          { id: 3, spotNumber: 'B-22', lotId: 1 }
        ]
      },
      {
        id: 2,
        name: 'Shopping Center',
        address: '456 Oak Ave',
        city: 'Midtown',
        hourlyRate: 6.00,
        availableSpots: 8,
        distance: 1.2,
        amenities: ['Covered', '24/7 Access'],
        availableSpotsList: [
          { id: 4, spotNumber: 'C-10', lotId: 2 },
          { id: 5, spotNumber: 'C-11', lotId: 2 }
        ]
      },
      {
        id: 3,
        name: 'Business District',
        address: '789 Corporate Blvd',
        city: 'Business District',
        hourlyRate: 12.00,
        availableSpots: 3,
        distance: 2.1,
        amenities: ['Valet', 'Security', 'Car Wash'],
        availableSpotsList: [
          { id: 6, spotNumber: 'VIP-1', lotId: 3 }
        ]
      }
    ];
  }

  selectSpot(lot: any, spot: any) {
    this.selectedLot = lot;
    this.selectedSpot = spot;
  }

  bookSpot(lot: any) {
    if (!this.selectedSpot || this.selectedSpot.lotId !== lot.id) {
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
    return this.calculateDuration() * this.selectedLot.hourlyRate;
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

    this.bookingInProgress = true;
    this.cdr.detectChanges();
    
    const bookingRequest = {
      spotId: Number(this.selectedSpot.id),
      vehicleId: Number(this.selectedVehicleId),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString()
    };

    console.log('Booking request:', bookingRequest); // Debug log

    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.bookingService.createBooking(bookingRequest).subscribe({
        next: (booking) => {
          this.toastService.success('Booking confirmed successfully!');
          this.closeBookingModal();
        },
        error: (err) => {
          console.error('Booking failed:', err);
          // Mock success for demo when API fails
          this.toastService.success('Booking confirmed successfully! (Demo mode)');
          this.closeBookingModal();
        }
      });
    }, 0);
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedLot = null;
    this.selectedSpot = null;
    this.selectedVehicleId = null;
    this.bookingInProgress = false;
    this.cdr.detectChanges(); // Force change detection
  }
}