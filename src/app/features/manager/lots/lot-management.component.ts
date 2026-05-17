import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-lot-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Lot Management <span class="text-indigo-500">🏢</span>
          </h1>
          <p class="text-gray-500 mt-1">Manage and monitor all your parking facilities.</p>
        </div>
        <button (click)="showCreateForm = true" class="btn-primary shadow-lg shadow-primary-500/20 whitespace-nowrap">
          <svg class="w-4.5 h-4.5 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add New Lot
        </button>
      </div>

      <!-- Create Lot Form -->
      <div *ngIf="showCreateForm" class="card p-0 overflow-hidden animate-fade-in border-indigo-100 ring-4 ring-indigo-50">
        <div class="p-6 border-b border-gray-100 bg-indigo-50/50 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Parking Lot Details' : 'Register New Parking Lot' }}</h3>
        </div>
        
        <form [formGroup]="lotForm" (ngSubmit)="createLot()" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="lg:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Lot Name</label>
              <input formControlName="name" class="input-field" placeholder="e.g. Downtown Plaza">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Total Spots</label>
              <input formControlName="totalSpots" type="number" class="input-field" placeholder="e.g. 50">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Hourly Rate ($)</label>
              <input formControlName="hourlyRate" type="number" step="0.1" class="input-field" placeholder="e.g. 5.00">
            </div>
            
            <div class="lg:col-span-3">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <input formControlName="address" class="input-field" placeholder="e.g. 123 Main Street">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
              <input formControlName="city" class="input-field" placeholder="e.g. New York">
            </div>
            
            <div class="lg:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Opening Time</label>
              <input formControlName="openTime" type="time" class="input-field">
            </div>
            <div class="lg:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Closing Time</label>
              <input formControlName="closeTime" type="time" class="input-field">
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label *ngFor="let amenity of availableAmenities" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                <input type="checkbox" [value]="amenity" (change)="toggleAmenity(amenity, $event)" 
                       class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
                <span class="text-sm font-medium text-gray-700">{{ amenity }}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" (click)="cancelCreate()" class="btn-secondary">Cancel</button>
            <button type="submit" [disabled]="lotForm.invalid || loading" class="btn-primary">
              {{ loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Lot' : 'Create Lot') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Lots List -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div *ngFor="let lot of lots" class="card p-0 overflow-hidden hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
          <!-- Lot Header -->
          <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl text-indigo-600 border border-gray-100 group-hover:border-indigo-200 transition-colors flex-shrink-0">
                🏢
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-gray-900 text-lg">{{ lot.name }}</h3>
                  <span class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        [ngClass]="getStatusClass(lot)">
                    {{ lot.isApproved ? (lot.isOpen ? 'OPEN' : 'CLOSED') : 'PENDING' }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-500 line-clamp-1">{{ lot.address }}, {{ lot.city }}</p>
              </div>
            </div>
            
            <div class="flex flex-col gap-1 sm:flex-row sm:gap-2">
              <button (click)="editLot(lot)" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit Lot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button (click)="deleteLot(lot.lotId)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Lot">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7"></path></svg>
              </button>
            </div>
          </div>
          
          <!-- Lot Body -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div class="space-y-6">
              <!-- Occupancy -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-semibold text-gray-600">Occupancy</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" [ngClass]="(lot.occupancyRate || 0) > 90 ? 'text-red-600' : 'text-primary-600'">{{ lot.occupancyRate || 0 }}%</span>
                    <span class="text-xs font-medium text-gray-400">({{ lot.totalSpots - (lot.availableSpots || 0) }}/{{ lot.totalSpots }})</span>
                  </div>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                  <div class="h-full transition-all duration-500 ease-out"
                       [ngClass]="(lot.occupancyRate || 0) > 90 ? 'bg-red-500' : 'bg-primary-500'"
                       [style.width.%]="lot.occupancyRate || 0"></div>
                </div>
              </div>
              
              <!-- Metrics Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-xl p-3 border border-green-100">
                  <span class="block text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Available</span>
                  <span class="text-xl font-extrabold text-green-700">{{ lot.availableSpots || 0 }}</span>
                </div>
                <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <span class="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Rate / Hr</span>
                  <span class="text-xl font-extrabold text-blue-700">\${{ lot.hourlyRate || '5.00' }}</span>
                </div>
              </div>
              
              <!-- Amenities -->
              <div *ngIf="lot.amenities && lot.amenities.length > 0">
                <span class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities</span>
                <div class="flex flex-wrap gap-1.5">
                  <span *ngFor="let amenity of lot.amenities" 
                        class="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider rounded-md border border-gray-200">
                    {{ amenity }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
              <button *ngIf="lot.isApproved" 
                      (click)="toggleLotStatus(lot)"
                      [class]="lot.isOpen ? 'btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 flex-1' : 'btn-secondary text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-200 flex-1'"
                      class="py-2.5">
                {{ lot.isOpen ? 'Close Lot' : 'Open Lot' }}
              </button>
              
              <button (click)="manageSpots(lot.lotId)" class="btn-primary flex-1 py-2.5">
                Manage Spots
              </button>
              
              <button (click)="viewAnalytics(lot.lotId)" class="p-2.5 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:text-primary-600 transition-colors" title="View Analytics">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="lots.length === 0" class="lg:col-span-2 card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-5">🏢</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No parking lots yet</h3>
          <p class="text-gray-500 mb-6 max-w-sm mx-auto">Create your first parking lot to start managing bookings and generating revenue.</p>
          <button (click)="showCreateForm = true" class="btn-primary shadow-lg shadow-primary-500/20">
            Create Your First Lot
          </button>
        </div>
      </div>

      <!-- Spot Management Modal -->
      <div *ngIf="showSpotModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
            <div>
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span class="text-primary-600">🚗</span> Manage Spots
              </h3>
              <p class="text-sm text-gray-500 font-medium">{{ selectedLot?.name }}</p>
            </div>
            <button (click)="closeSpotModal()" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1 bg-white">
            
            <!-- Tools/Legend Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div class="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-gray-600">
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 bg-green-500 rounded ring-2 ring-green-100"></div>
                  <span>Available</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 bg-red-500 rounded ring-2 ring-red-100"></div>
                  <span>Occupied</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 bg-gray-400 rounded ring-2 ring-gray-100"></div>
                  <span>Reserved</span>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input #newPrice type="number" step="0.1" class="w-24 pl-7 pr-3 py-1.5 rounded-lg border-gray-300 text-sm font-bold shadow-sm focus:ring-primary-500 focus:border-primary-500" value="5.0">
                </div>
                <button (click)="syncSpotPrices(newPrice.value)" class="btn-primary text-xs px-3 py-2 whitespace-nowrap shadow-sm">
                  Sync All Prices
                </button>
              </div>
            </div>

            <!-- Spot Grid -->
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              <div *ngFor="let spot of spots" 
                   class="aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-sm relative group"
                   [ngClass]="getSpotClass(spot)"
                   (click)="toggleSpotStatus(spot)">
                <span class="text-sm font-black">{{ spot.spotNumber }}</span>
                
                <!-- Tooltip -->
                <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Status: {{ spot.status }}
                  <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>

            <!-- Empty Spots State -->
            <div *ngIf="spots.length === 0 && !loading" class="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </div>
              <h4 class="text-lg font-bold text-gray-900 mb-2">No spots initialized</h4>
              <p class="text-gray-500 mb-6 max-w-sm mx-auto">Generate the spots grid for this parking lot to start accepting bookings.</p>
              <button (click)="generateSpots()" class="btn-primary shadow-lg shadow-primary-500/20 mx-auto">
                Initialize {{ selectedLot?.totalSpots }} Spots
              </button>
            </div>
            
          </div>
          
          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button (click)="closeSpotModal()" class="btn-primary px-6">Done</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LotManagementComponent implements OnInit, OnDestroy {
  private lotService = inject(ParkingLotService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  private authSubscription?: any;

  lots: any[] = [];
  spots: any[] = [];
  showCreateForm = false;
  showSpotModal = false;
  selectedLot: any = null;
  loading = false;
  isEditing = false;
  selectedLotId: number | null = null;
  selectedAmenities: string[] = [];

  availableAmenities = [
    'Covered', 'Security', 'EV Charging', '24/7 Access', 
    'Valet', 'Car Wash', 'Restrooms', 'WiFi'
  ];

  lotForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
    totalSpots: [0, [Validators.required, Validators.min(1)]],
    hourlyRate: [5.0, [Validators.required, Validators.min(0)]],
    openTime: ['06:00'],
    closeTime: ['22:00']
  });

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadLots();
      }
    });
  }

  loadLots() {
    const user = this.authService.currentUserValue;
    if (!user || !user.id) return;

    this.loading = true;
    this.lotService.getManagerLots(user.id).subscribe({
      next: (response) => {
        // Robustly handle both Page<T> and T[] responses
        this.lots = Array.isArray(response) ? response : (response.content || []);
        this.syncLotAvailability(); // New method to get real-time counts
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load lots:', err);
        this.toastService.error('Failed to load your parking lots');
        this.lots = [];
        this.loading = false;
      }
    });
  }

  syncLotAvailability() {
    this.lots.forEach(lot => {
      this.lotService.getAvailableCount(lot.lotId.toString()).subscribe({
        next: (count) => {
          lot.availableSpots = count;
          const total = lot.totalSpots || 0;
          const occupied = Math.max(0, total - count);
          lot.occupiedSpots = occupied;
          lot.occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
          this.cdr.detectChanges();
        }
      });
    });
  }

  createLot() {
    if (this.lotForm.invalid) return;

    this.loading = true;
    const lotData = {
      ...this.lotForm.value,
      managerId: this.authService.currentUserValue?.id,
      isApproved: this.isEditing ? this.lots.find(l => l.lotId === this.selectedLotId)?.isApproved : false,
      isOpen: this.isEditing ? this.lots.find(l => l.lotId === this.selectedLotId)?.isOpen : false,
      amenities: this.selectedAmenities
    };

    const action = this.isEditing 
      ? this.lotService.updateLot(this.selectedLotId!.toString(), lotData as any)
      : this.lotService.createLot(lotData as any);

    action.subscribe({
      next: (lot) => {
        this.toastService.success(this.isEditing ? 'Parking lot updated successfully!' : 'Parking lot created successfully! Awaiting admin approval.');
        this.cancelCreate();
        this.loadLots();
        this.loading = false;
      },
      error: (err) => {
        console.error(`Failed to ${this.isEditing ? 'update' : 'create'} lot:`, err);
        this.toastService.error(err.error?.message || `Failed to ${this.isEditing ? 'update' : 'create'} lot`);
        this.loading = false;
      }
    });
  }

  editLot(lot: any) {
    this.isEditing = true;
    this.selectedLotId = lot.lotId;
    this.showCreateForm = true;
    
    this.lotForm.patchValue({
      name: lot.name,
      address: lot.address,
      city: lot.city,
      latitude: lot.latitude,
      longitude: lot.longitude,
      totalSpots: lot.totalSpots,
      hourlyRate: lot.hourlyRate || 5.0,
      openTime: lot.openTime,
      closeTime: lot.closeTime
    });
    
    this.selectedAmenities = lot.amenities || [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteLot(lotId: number) {
    if (confirm('Are you sure you want to delete this parking lot?')) {
      this.lotService.deleteLot(lotId).subscribe({
        next: () => {
          this.lots = this.lots.filter(l => l.lotId !== lotId);
          this.toastService.success('Parking lot deleted successfully!');
        },
        error: (err) => {
          console.error('Failed to delete lot:', err);
          this.toastService.error('Failed to delete parking lot');
        }
      });
    }
  }

  toggleLotStatus(lot: any) {
    const action = lot.isOpen ? 'close' : 'open';
    if (confirm(`Are you sure you want to ${action} this parking lot?`)) {
      this.lotService.toggleLotStatus(lot.lotId.toString(), !lot.isOpen).subscribe({
        next: () => {
          setTimeout(() => {
            lot.isOpen = !lot.isOpen;
            this.toastService.success(`Parking lot ${action}ed successfully!`);
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          console.error(`Failed to ${action} lot:`, err);
          this.toastService.error(`Failed to ${action} lot`);
        }
      });
    }
  }

  viewAnalytics(lotId: number) {
    this.toastService.info('Analytics view coming soon!');
  }

  manageSpots(lotId: number) {
    this.selectedLot = this.lots.find(l => l.lotId === lotId);
    this.loadSpots(lotId);
    this.showSpotModal = true;
  }

  loadSpots(lotId: number) {
    this.loading = true;
    this.lotService.getSpotsByLotId(lotId.toString()).subscribe({
      next: (response: any) => {
        console.log('Spots API response:', response);
        // Robustly handle both Page<T> and T[] responses
        this.spots = Array.isArray(response) ? response : (response.content || []);
        console.log('Processed spots array:', this.spots);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load spots:', err);
        this.toastService.error('Failed to load parking spots');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateSpots() {
    if (!this.selectedLot) return;
    
    this.loading = true;
    const totalSpots = this.selectedLot.totalSpots || 0;
    
    const bulkRequest = {
      lotId: this.selectedLot.lotId,
      count: totalSpots,
      floor: 'G', // Default to Ground Floor
      spotType: 'STANDARD',
      vehicleType: 'FOUR_WHEELER',
      pricePerHour: this.lotForm.get('hourlyRate')?.value || 5.0,
      prefix: 'A',
      isEVCharging: false,
      isHandicapped: false
    };

    this.lotService.addSpotsBulk(bulkRequest).subscribe({
      next: (res) => {
        this.toastService.success(`Successfully initialized ${totalSpots} spots!`);
        this.loadSpots(this.selectedLot.lotId);
      },
      error: (err) => {
        console.error('Failed to generate spots:', err);
        this.toastService.error(err.error?.message || 'Failed to initialize spots');
        this.loading = false;
      }
    });
  }

  toggleSpotStatus(spot: any) {
    if (spot.status === 'OCCUPIED') {
      this.toastService.warning('Cannot modify occupied spots manually');
      return;
    }
    
    const action = spot.status === 'AVAILABLE' 
      ? this.lotService.reserveSpot(spot.spotId.toString())
      : this.lotService.releaseSpot(spot.spotId.toString());

    action.subscribe({
      next: (res) => {
        spot.status = res.status;
        const statusLabel = res.status === 'AVAILABLE' ? 'available' : 'reserved';
        this.toastService.success(`Spot ${spot.spotNumber} is now ${statusLabel}`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update spot:', err);
        this.toastService.error('Failed to update spot status');
      }
    });
  }

  getSpotClass(spot: any): string {
    switch (spot.status) {
      case 'AVAILABLE':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'OCCUPIED':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'RESERVED':
        return 'bg-gray-400 text-white hover:bg-gray-500';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  }

  closeSpotModal() {
    this.showSpotModal = false;
    this.selectedLot = null;
    this.spots = [];
    this.loadLots(); // Refresh lot counts after management
  }

  syncSpotPrices(price: string) {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      this.toastService.error('Please enter a valid price');
      return;
    }

    if (!confirm(`Are you sure you want to update all ${this.spots.length} spots to $${numericPrice}/hr?`)) {
      return;
    }

    this.loading = true;
    const updateObservables = this.spots.map(spot => 
      this.lotService.updateSpot(spot.spotId.toString(), { ...spot, pricePerHour: numericPrice })
    );

    // Using forkJoin for parallel updates
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(updateObservables).subscribe({
        next: () => {
          this.toastService.success(`All spots updated to $${numericPrice}/hr`);
          this.loadSpots(this.selectedLot.lotId);
        },
        error: (err) => {
          console.error('Failed to sync prices:', err);
          this.toastService.error('Failed to update some spots');
          this.loading = false;
        }
      });
    });
  }

  toggleAmenity(amenity: string, event: any) {
    if (event.target.checked) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities = this.selectedAmenities.filter(a => a !== amenity);
    }
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.isEditing = false;
    this.selectedLotId = null;
    this.lotForm.reset({
      openTime: '06:00',
      closeTime: '22:00',
      latitude: 0,
      longitude: 0
    });
    this.selectedAmenities = [];
  }

  getStatusClass(lot: any): string {
    if (!lot.isApproved) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    }
    return lot.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}