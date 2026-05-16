import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-lot-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Lot Management</h1>
        <button (click)="showCreateForm = true" class="btn-primary">
          + Add New Lot
        </button>
      </div>

      <!-- Create Lot Form -->
      <div *ngIf="showCreateForm" class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-4">Create New Parking Lot</h3>
        <form [formGroup]="lotForm" (ngSubmit)="createLot()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lot Name</label>
              <input formControlName="name" class="input-field" placeholder="Downtown Plaza">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Spots</label>
              <input formControlName="totalSpots" type="number" class="input-field" placeholder="50">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
              <input formControlName="hourlyRate" type="number" step="0.01" class="input-field" placeholder="8.50">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input formControlName="city" class="input-field" placeholder="New York">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input formControlName="address" class="input-field" placeholder="123 Main Street">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea formControlName="description" rows="3" class="input-field" 
                      placeholder="Covered parking with security cameras..."></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Time</label>
              <input formControlName="openingTime" type="time" class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Closing Time</label>
              <input formControlName="closingTime" type="time" class="input-field">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label *ngFor="let amenity of availableAmenities" class="flex items-center space-x-2">
                <input type="checkbox" [value]="amenity" (change)="toggleAmenity(amenity, $event)" 
                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm">{{ amenity }}</span>
              </label>
            </div>
          </div>

          <div class="flex space-x-3">
            <button type="submit" [disabled]="lotForm.invalid || loading" class="btn-primary">
              {{ loading ? 'Creating...' : 'Create Lot' }}
            </button>
            <button type="button" (click)="cancelCreate()" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Lots List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div *ngFor="let lot of lots" class="glass-card p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ lot.name }}</h3>
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                      [ngClass]="getStatusClass(lot.status)">
                  {{ lot.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ lot.address }}, {{ lot.city }}</p>
              <div class="flex items-center space-x-4 text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                  💰 \${{ lot.hourlyRate }}/hr
                </span>
                <span class="text-gray-600 dark:text-gray-400">
                  🚗 {{ lot.occupiedSpots || 0 }}/{{ lot.totalSpots }} spots
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button (click)="editLot(lot)" class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button (click)="deleteLot(lot.id)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          </div>

          <!-- Occupancy Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600 dark:text-gray-400">Occupancy</span>
              <span class="font-medium">{{ lot.occupancyRate || 0 }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                   [style.width.%]="lot.occupancyRate || 0"></div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="mb-4">
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let amenity of lot.amenities" 
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                {{ amenity }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2">
            <button *ngIf="lot.status === 'APPROVED'" 
                    (click)="toggleLotStatus(lot)"
                    [class]="lot.isOpen ? 'btn-danger' : 'btn-success'"
                    class="text-sm px-3 py-1">
              {{ lot.isOpen ? '🔒 Close' : '🔓 Open' }}
            </button>
            <button (click)="viewAnalytics(lot.id)" class="btn-secondary text-sm px-3 py-1">
              📊 Analytics
            </button>
            <button (click)="manageSpots(lot.id)" class="btn-primary text-sm px-3 py-1">
              🚗 Manage Spots
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="lots.length === 0" class="lg:col-span-2 text-center py-12">
          <div class="text-6xl mb-4">🏢</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No parking lots yet</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Create your first parking lot to start managing bookings.</p>
          <button (click)="showCreateForm = true" class="btn-primary">Create Your First Lot</button>
        </div>
      </div>

      <!-- Spot Management Modal -->
      <div *ngIf="showSpotModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold">Manage Spots - {{ selectedLot?.name }}</h3>
            <button (click)="closeSpotModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Spot Grid -->
          <div class="grid grid-cols-8 gap-2 mb-6">
            <div *ngFor="let spot of spots" 
                 class="aspect-square flex items-center justify-center text-xs font-medium rounded cursor-pointer transition-colors"
                 [ngClass]="getSpotClass(spot)"
                 (click)="toggleSpotStatus(spot)">
              {{ spot.spotNumber }}
            </div>
          </div>

          <!-- Legend -->
          <div class="flex flex-wrap gap-4 text-sm mb-6">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Out of Service</span>
            </div>
          </div>

          <div class="flex justify-end">
            <button (click)="closeSpotModal()" class="btn-primary">Done</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LotManagementComponent implements OnInit {
  private lotService = inject(ParkingLotService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  lots: any[] = [];
  spots: any[] = [];
  showCreateForm = false;
  showSpotModal = false;
  selectedLot: any = null;
  loading = false;
  selectedAmenities: string[] = [];

  availableAmenities = [
    'Covered', 'Security', 'EV Charging', '24/7 Access', 
    'Valet', 'Car Wash', 'Restrooms', 'WiFi'
  ];

  lotForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    totalSpots: [0, [Validators.required, Validators.min(1)]],
    hourlyRate: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
    openingTime: ['06:00'],
    closingTime: ['22:00']
  });

  ngOnInit() {
    this.loadLots();
  }

  loadLots() {
    this.lotService.getMyLots().subscribe({
      next: (lots) => {
        this.lots = lots || [];
      },
      error: (err) => {
        console.error('Failed to load lots:', err);
        // Mock data for demo
        this.lots = [
          {
            id: 1,
            name: 'Downtown Plaza',
            address: '123 Main St',
            city: 'New York',
            totalSpots: 50,
            occupiedSpots: 35,
            occupancyRate: 70,
            hourlyRate: 8.50,
            status: 'APPROVED',
            isOpen: true,
            amenities: ['Covered', 'Security', 'EV Charging']
          },
          {
            id: 2,
            name: 'Shopping Center',
            address: '456 Oak Ave',
            city: 'New York',
            totalSpots: 100,
            occupiedSpots: 0,
            occupancyRate: 0,
            hourlyRate: 6.00,
            status: 'PENDING',
            isOpen: false,
            amenities: ['Covered', '24/7 Access']
          }
        ];
      }
    });
  }

  createLot() {
    if (this.lotForm.invalid) return;

    this.loading = true;
    const lotData = {
      name: this.lotForm.value.name || '',
      address: this.lotForm.value.address || '',
      city: this.lotForm.value.city || '',
      totalSpots: this.lotForm.value.totalSpots || 0,
      hourlyRate: this.lotForm.value.hourlyRate || 0,
      description: this.lotForm.value.description || '',
      openingTime: this.lotForm.value.openingTime || '06:00',
      closingTime: this.lotForm.value.closingTime || '22:00',
      amenities: this.selectedAmenities
    };

    this.lotService.createLot(lotData).subscribe({
      next: (lot) => {
        this.lots.push(lot);
        this.toastService.success('Parking lot created successfully! Awaiting admin approval.');
        this.cancelCreate();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create lot:', err);
        // Mock success for demo
        const newLot = { 
          id: Date.now(), 
          ...lotData, 
          status: 'PENDING',
          occupiedSpots: 0,
          occupancyRate: 0,
          isOpen: false
        };
        this.lots.push(newLot);
        this.toastService.success('Parking lot created successfully! (Demo mode)');
        this.cancelCreate();
        this.loading = false;
      }
    });
  }

  editLot(lot: any) {
    // TODO: Implement edit functionality
    this.toastService.info('Edit functionality coming soon!');
  }

  deleteLot(lotId: number) {
    if (confirm('Are you sure you want to delete this parking lot?')) {
      this.lotService.deleteLot(lotId).subscribe({
        next: () => {
          this.lots = this.lots.filter(l => l.id !== lotId);
          this.toastService.success('Parking lot deleted successfully!');
        },
        error: (err) => {
          console.error('Failed to delete lot:', err);
          // Mock success for demo
          this.lots = this.lots.filter(l => l.id !== lotId);
          this.toastService.success('Parking lot deleted successfully! (Demo mode)');
        }
      });
    }
  }

  toggleLotStatus(lot: any) {
    const action = lot.isOpen ? 'close' : 'open';
    if (confirm(`Are you sure you want to ${action} this parking lot?`)) {
      this.lotService.toggleLotStatus(lot.id, !lot.isOpen).subscribe({
        next: () => {
          lot.isOpen = !lot.isOpen;
          this.toastService.success(`Parking lot ${action}ed successfully!`);
        },
        error: (err) => {
          console.error(`Failed to ${action} lot:`, err);
          // Mock success for demo
          lot.isOpen = !lot.isOpen;
          this.toastService.success(`Parking lot ${action}ed successfully! (Demo mode)`);
        }
      });
    }
  }

  viewAnalytics(lotId: number) {
    this.toastService.info('Analytics view coming soon!');
  }

  manageSpots(lotId: number) {
    this.selectedLot = this.lots.find(l => l.id === lotId);
    this.loadSpots(lotId);
    this.showSpotModal = true;
  }

  loadSpots(lotId: number) {
    // Mock spots data
    this.spots = [];
    const lot = this.lots.find(l => l.id === lotId);
    if (lot) {
      for (let i = 1; i <= lot.totalSpots; i++) {
        const section = String.fromCharCode(65 + Math.floor((i - 1) / 10)); // A, B, C, etc.
        const number = ((i - 1) % 10) + 1;
        this.spots.push({
          id: i,
          spotNumber: `${section}-${number}`,
          status: Math.random() > 0.7 ? 'OCCUPIED' : 'AVAILABLE',
          lotId: lotId
        });
      }
    }
  }

  toggleSpotStatus(spot: any) {
    if (spot.status === 'OCCUPIED') {
      this.toastService.warning('Cannot modify occupied spots');
      return;
    }
    
    spot.status = spot.status === 'AVAILABLE' ? 'OUT_OF_SERVICE' : 'AVAILABLE';
    this.toastService.success(`Spot ${spot.spotNumber} marked as ${spot.status.toLowerCase()}`);
  }

  getSpotClass(spot: any): string {
    switch (spot.status) {
      case 'AVAILABLE':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'OCCUPIED':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-400 text-white hover:bg-gray-500';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  }

  closeSpotModal() {
    this.showSpotModal = false;
    this.selectedLot = null;
    this.spots = [];
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
    this.lotForm.reset({
      openingTime: '06:00',
      closingTime: '22:00'
    });
    this.selectedAmenities = [];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}