import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            My Vehicles <span class="text-blue-500">🚗</span>
          </h1>
          <p class="text-gray-500 mt-1">Manage the vehicles you use for parking.</p>
        </div>
        <button (click)="openAddForm()" class="btn-primary shadow-lg shadow-primary-500/20 whitespace-nowrap">
          <svg class="w-4.5 h-4.5 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add Vehicle
        </button>
      </div>

      <!-- Add/Edit Vehicle Form -->
      <div *ngIf="showForm" class="card p-0 overflow-hidden animate-fade-in border-primary-100 ring-4 ring-primary-50">
        <div class="p-6 border-b border-gray-100 bg-primary-50/50 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Vehicle Details' : 'Register New Vehicle' }}</h3>
        </div>
        
        <form [formGroup]="vehicleForm" (ngSubmit)="submitForm()" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">License Plate</label>
              <input formControlName="licensePlate" class="input-field" placeholder="e.g. ABC-1234">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Type</label>
              <select formControlName="vehicleType" class="input-field bg-white">
                <option value="FOUR_WHEELER">Car / SUV</option>
                <option value="TWO_WHEELER">Motorcycle / Bike</option>
                <option value="HEAVY">Truck / Bus / Heavy</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Make</label>
              <input formControlName="make" class="input-field" placeholder="e.g. Toyota">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Model</label>
              <input formControlName="model" class="input-field" placeholder="e.g. Camry">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Color</label>
              <input formControlName="color" class="input-field" placeholder="e.g. Blue">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
              <input formControlName="year" type="number" class="input-field" placeholder="e.g. 2020">
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" (click)="cancelForm()" class="btn-secondary">Cancel</button>
            <button type="submit" [disabled]="vehicleForm.invalid || loading" class="btn-primary">
              {{ loading ? 'Saving...' : (isEditing ? 'Update Vehicle' : 'Add Vehicle') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Vehicles List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vehicle of vehicles" class="card p-0 overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
          <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl text-primary-600 border border-gray-100 group-hover:border-primary-200 transition-colors">
                {{ getVehicleIcon(vehicle.vehicleType) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">{{ vehicle.licensePlate }}</h3>
                <p class="text-sm font-medium text-gray-500">{{ vehicle.make }} {{ vehicle.model }}</p>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <button (click)="editVehicle(vehicle)" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit Vehicle">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button (click)="deleteVehicle(vehicle.vehicleId)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Vehicle">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7"></path></svg>
              </button>
            </div>
          </div>
          
          <div class="p-6 space-y-3">
            <div class="flex justify-between items-center py-1">
              <span class="text-sm font-medium text-gray-500">Type</span>
              <span class="text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">{{ vehicle.vehicleType }}</span>
            </div>
            <div class="flex justify-between items-center py-1 border-t border-gray-50">
              <span class="text-sm font-medium text-gray-500">Color</span>
              <span class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div *ngIf="vehicle.color" class="w-3 h-3 rounded-full border border-gray-200" [style.backgroundColor]="vehicle.color.toLowerCase()"></div>
                {{ vehicle.color || 'N/A' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-1 border-t border-gray-50">
              <span class="text-sm font-medium text-gray-500">Year</span>
              <span class="text-sm font-bold text-gray-900">{{ vehicle.year || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="vehicles.length === 0 && !loadingVehicles" class="md:col-span-2 lg:col-span-3 card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm mb-5">🚗</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No vehicles registered</h3>
          <p class="text-gray-500 mb-6 max-w-sm mx-auto">Add your first vehicle to start booking parking spots. It only takes a minute!</p>
          <button (click)="openAddForm()" class="btn-primary shadow-lg shadow-primary-500/20">
            Add Your First Vehicle
          </button>
        </div>
      </div>
    </div>
  `
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  vehicles: any[] = [];
  showForm = false;
  isEditing = false;
  selectedVehicleId: number | null = null;
  loading = false;
  loadingVehicles = true;

  vehicleForm = this.fb.group({
    licensePlate: ['', Validators.required],
    vehicleType: ['FOUR_WHEELER', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    color: [''],
    year: [new Date().getFullYear()]
  });

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.loadingVehicles = true;
    this.vehicleService.getMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles || [];
        this.loadingVehicles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load vehicles:', err);
        this.loadingVehicles = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.isEditing = false;
    this.selectedVehicleId = null;
    this.vehicleForm.reset({
      vehicleType: 'FOUR_WHEELER',
      year: new Date().getFullYear()
    });
    this.showForm = true;
    this.cdr.detectChanges();
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.selectedVehicleId = null;
    this.vehicleForm.reset({
      vehicleType: 'FOUR_WHEELER',
      year: new Date().getFullYear()
    });
    this.cdr.detectChanges();
  }

  submitForm() {
    if (this.isEditing) {
      this.updateVehicle();
    } else {
      this.addVehicle();
    }
  }

  addVehicle() {
    if (this.vehicleForm.invalid) return;

    this.loading = true;
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe({
      next: (vehicle) => {
        this.vehicles.push(vehicle);
        this.toastService.success('Vehicle added successfully!');
        this.cancelForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to add vehicle:', err);
        this.toastService.error(err.error?.message || 'Failed to add vehicle');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateVehicle() {
    if (this.vehicleForm.invalid || !this.selectedVehicleId) return;

    this.loading = true;
    this.vehicleService.updateVehicle(this.selectedVehicleId, this.vehicleForm.value).subscribe({
      next: (updated) => {
        const index = this.vehicles.findIndex(v => v.vehicleId === this.selectedVehicleId);
        if (index !== -1) {
          this.vehicles[index] = updated;
        }
        this.toastService.success('Vehicle updated successfully!');
        this.cancelForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update vehicle:', err);
        this.toastService.error(err.error?.message || 'Failed to update vehicle');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editVehicle(vehicle: any) {
    this.isEditing = true;
    this.selectedVehicleId = vehicle.vehicleId;
    this.showForm = true;
    this.vehicleForm.patchValue({
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year || new Date().getFullYear()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  deleteVehicle(vehicleId: number) {
    if (!vehicleId) {
      this.toastService.error('Cannot delete vehicle: Missing ID');
      return;
    }

    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.vehicles = this.vehicles.filter(v => v.vehicleId !== vehicleId);
          this.toastService.success('Vehicle deleted successfully!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete vehicle:', err);
          if (err.status === 404 || err.status === 400) {
            this.vehicles = this.vehicles.filter(v => v.vehicleId !== vehicleId);
            this.toastService.info('Removed local reference to non-existent vehicle.');
          } else {
            this.toastService.error(err.error?.message || 'Failed to delete vehicle');
          }
          this.cdr.detectChanges();
        }
      });
    }
  }


  getVehicleIcon(type: string): string {
    switch (type) {
      case 'FOUR_WHEELER': return '🚗';
      case 'TWO_WHEELER': return '🏍️';
      case 'HEAVY': return '🚚';
      default: return '🚗';
    }
  }
}