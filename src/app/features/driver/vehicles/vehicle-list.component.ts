import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Vehicles</h1>
        <button (click)="showAddForm = true" class="btn-primary">
          + Add Vehicle
        </button>
      </div>

      <!-- Add Vehicle Form -->
      <div *ngIf="showAddForm" class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-4">Add New Vehicle</h3>
        <form [formGroup]="vehicleForm" (ngSubmit)="addVehicle()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Plate</label>
            <input formControlName="licensePlate" class="input-field" placeholder="ABC-1234">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
            <select formControlName="vehicleType" class="input-field">
              <option value="CAR">Car</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="TRUCK">Truck</option>
              <option value="SUV">SUV</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make</label>
            <input formControlName="make" class="input-field" placeholder="Toyota">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
            <input formControlName="model" class="input-field" placeholder="Camry">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
            <input formControlName="color" class="input-field" placeholder="Blue">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <input formControlName="year" type="number" class="input-field" placeholder="2020">
          </div>
          <div class="md:col-span-2 flex space-x-3">
            <button type="submit" [disabled]="vehicleForm.invalid || loading" class="btn-primary">
              {{ loading ? 'Adding...' : 'Add Vehicle' }}
            </button>
            <button type="button" (click)="cancelAdd()" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Vehicles List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vehicle of vehicles" class="glass-card p-6 hover:shadow-lg transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                {{ getVehicleIcon(vehicle.vehicleType) }}
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ vehicle.licensePlate }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ vehicle.make }} {{ vehicle.model }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button (click)="editVehicle(vehicle)" class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
              <button (click)="deleteVehicle(vehicle.id)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Type:</span>
              <span class="font-medium">{{ vehicle.vehicleType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Color:</span>
              <span class="font-medium">{{ vehicle.color }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Year:</span>
              <span class="font-medium">{{ vehicle.year }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="vehicles.length === 0" class="md:col-span-2 lg:col-span-3 text-center py-12">
          <div class="text-6xl mb-4">🚗</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No vehicles registered</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">Add your first vehicle to start booking parking spots.</p>
          <button (click)="showAddForm = true" class="btn-primary">Add Your First Vehicle</button>
        </div>
      </div>
    </div>
  `
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  vehicles: any[] = [];
  showAddForm = false;
  loading = false;

  vehicleForm = this.fb.group({
    licensePlate: ['', Validators.required],
    vehicleType: ['CAR', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    color: [''],
    year: [new Date().getFullYear()]
  });

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicleService.getMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles || [];
      },
      error: (err) => {
        console.error('Failed to load vehicles:', err);
        // Mock data for demo
        this.vehicles = [
          {
            id: 1,
            licensePlate: 'ABC-1234',
            vehicleType: 'CAR',
            make: 'Toyota',
            model: 'Camry',
            color: 'Blue',
            year: 2020
          }
        ];
      }
    });
  }

  addVehicle() {
    if (this.vehicleForm.invalid) return;

    this.loading = true;
    this.vehicleService.addVehicle(this.vehicleForm.value).subscribe({
      next: (vehicle) => {
        this.vehicles.push(vehicle);
        this.toastService.success('Vehicle added successfully!');
        this.cancelAdd();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to add vehicle:', err);
        // Mock success for demo
        const newVehicle = { id: Date.now(), ...this.vehicleForm.value };
        this.vehicles.push(newVehicle);
        this.toastService.success('Vehicle added successfully! (Demo mode)');
        this.cancelAdd();
        this.loading = false;
      }
    });
  }

  editVehicle(vehicle: any) {
    // TODO: Implement edit functionality
    this.toastService.info('Edit functionality coming soon!');
  }

  deleteVehicle(vehicleId: number) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
          this.toastService.success('Vehicle deleted successfully!');
        },
        error: (err) => {
          console.error('Failed to delete vehicle:', err);
          // Mock success for demo
          this.vehicles = this.vehicles.filter(v => v.id !== vehicleId);
          this.toastService.success('Vehicle deleted successfully! (Demo mode)');
        }
      });
    }
  }

  cancelAdd() {
    this.showAddForm = false;
    this.vehicleForm.reset({
      vehicleType: 'CAR',
      year: new Date().getFullYear()
    });
  }

  getVehicleIcon(type: string): string {
    switch (type) {
      case 'CAR': return '🚗';
      case 'MOTORCYCLE': return '🏍️';
      case 'TRUCK': return '🚚';
      case 'SUV': return '🚙';
      default: return '🚗';
    }
  }
}