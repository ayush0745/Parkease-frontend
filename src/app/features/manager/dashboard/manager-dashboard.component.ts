import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ParkingLotService } from '../../../core/services/parking-lot.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { filter, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Manager Dashboard</h1>
          <p class="text-gray-500 mt-1">Overview of your parking lots and revenue.</p>
        </div>
        <button routerLink="/manager/lots" class="btn-primary shadow-lg shadow-primary-500/20 whitespace-nowrap">
          <svg class="w-4.5 h-4.5 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Manage Lots
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-6 border-l-4 border-l-primary-500 hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Lots</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-1">{{ stats.totalLots }}</p>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-l-4 border-l-blue-500 hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Bookings</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-1">{{ stats.activeBookings }}</p>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-l-4 border-l-green-500 hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Occupancy Rate</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-1">{{ stats.occupancyRate }}%</p>
            </div>
          </div>
        </div>
        
        <div class="card p-6 border-l-4 border-l-yellow-500 hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today's Revenue</p>
              <p class="text-3xl font-extrabold text-gray-900 mt-1">\${{ stats.todayRevenue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Parking Lots -->
      <div class="card p-0 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">🏢</span>
            My Parking Lots
          </h2>
          <button (click)="toggleCreateForm()" class="btn-primary py-2 px-4 text-sm">
            {{ showCreateForm ? 'Cancel' : 'Add New Lot' }}
          </button>
        </div>

        <!-- Create Lot Form -->
        <div *ngIf="showCreateForm" class="p-6 border-b border-gray-100 bg-white animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Edit Parking Lot' : 'Register New Parking Lot' }}</h3>
          </div>
          
          <form [formGroup]="lotForm" (ngSubmit)="createLot()" class="space-y-5 max-w-4xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Lot Name</label>
                <input formControlName="name" class="input-field" placeholder="e.g. Downtown Plaza">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Total Spots</label>
                <input formControlName="totalSpots" type="number" class="input-field" placeholder="50">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <input formControlName="city" class="input-field" placeholder="New York">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Hourly Rate ($)</label>
                <input formControlName="hourlyRate" type="number" step="0.1" class="input-field" placeholder="5.00">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
              <input formControlName="address" class="input-field" placeholder="123 Main Street">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Latitude</label>
                <input formControlName="latitude" type="number" step="0.000001" class="input-field" placeholder="40.7128">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Longitude</label>
                <input formControlName="longitude" type="number" step="0.000001" class="input-field" placeholder="-74.0060">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Opening Time</label>
                <input formControlName="openTime" type="time" class="input-field">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Closing Time</label>
                <input formControlName="closeTime" type="time" class="input-field">
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" (click)="toggleCreateForm()" class="btn-secondary">Cancel</button>
              <button type="submit" [disabled]="lotForm.invalid || loading" class="btn-primary">
                {{ loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Lot' : 'Submit for Approval') }}
              </button>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lot</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Occupancy</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngIf="lots.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <p class="text-sm font-medium">No parking lots found</p>
                    <p class="text-xs text-gray-400 mt-1">Add your first parking lot to start managing.</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let lot of lots" class="hover:bg-gray-50/50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ lot.name }}</p>
                      <p class="text-sm text-gray-500 truncate max-w-xs">{{ lot.address }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider"
                        [ngClass]="{
                          'bg-green-100 text-green-700': lot.status === 'APPROVED' && lot.isOpen,
                          'bg-yellow-100 text-yellow-700': lot.status === 'PENDING',
                          'bg-red-100 text-red-700': lot.status === 'REJECTED',
                          'bg-gray-100 text-gray-600': !lot.isOpen
                        }">
                    {{ lot.status === 'APPROVED' ? (lot.isOpen ? 'Open' : 'Closed') : lot.status }}
                  </span>
                </td>
                <td class="px-6 py-4 min-w-[200px]">
                  <div class="flex flex-col gap-1.5">
                    <div class="flex justify-between text-xs font-semibold">
                      <span class="text-gray-500">Capacity</span>
                      <span class="text-gray-900">{{ lot.occupiedSpots }}/{{ lot.totalSpots }}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                           [style.width.%]="lot.occupancyRate"
                           [ngClass]="{'bg-red-500': lot.occupancyRate >= 90, 'bg-yellow-500': lot.occupancyRate >= 75 && lot.occupancyRate < 90}"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-bold text-gray-900">\${{ lot.todayRevenue }}</p>
                  <p class="text-xs font-medium text-gray-500">Today</p>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button (click)="viewLot(lot.lotId)" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Details">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button (click)="editLot(lot)" class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit Lot">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button *ngIf="lot.isApproved && lot.status === 'APPROVED'" 
                            (click)="toggleLotStatus(lot)" 
                            class="p-1.5 rounded-lg transition-colors"
                            [title]="lot.isOpen ? 'Close Lot' : 'Open Lot'"
                            [ngClass]="{
                              'text-red-500 hover:text-red-700 hover:bg-red-50': lot.isOpen,
                              'text-green-500 hover:text-green-700 hover:bg-green-50': !lot.isOpen
                            }">
                      <svg *ngIf="lot.isOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <svg *ngIf="!lot.isOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity & Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Recent Bookings -->
        <div class="card p-0 lg:col-span-2 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span class="text-blue-500">📋</span> Recent Bookings
            </h2>
          </div>
          
          <div class="p-2">
            <div *ngIf="recentBookings.length === 0" class="text-center py-10 text-gray-500 text-sm">
              No recent bookings found.
            </div>
            <div class="space-y-1">
              <div *ngFor="let booking of recentBookings" class="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                    {{ booking.vehiclePlate | slice:0:2 }}
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">{{ booking.lotName }}</p>
                    <div class="flex items-center gap-3 text-xs font-medium text-gray-500 mt-1">
                      <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>{{ booking.vehiclePlate }}</span>
                      <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>{{ booking.spotNumber }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="text-right flex flex-col items-end">
                  <p class="font-bold text-gray-900">\${{ booking.amount }}</p>
                  <span class="mt-1 inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-700': booking.status === 'CHECKED_IN' || booking.status === 'ACTIVE',
                          'bg-blue-100 text-blue-700': booking.status === 'CONFIRMED' || booking.status === 'RESERVED',
                          'bg-gray-100 text-gray-600': booking.status === 'COMPLETED'
                        }">
                    {{ booking.status }}
                  </span>
                  <p class="text-[10px] text-gray-400 mt-1">{{ booking.startTime | date:'MMM d, h:mm a' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card p-0 overflow-hidden h-fit">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span class="text-accent-500">📈</span> Performance
            </h2>
          </div>
          
          <div class="p-6 space-y-5">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div> Average Occupancy
              </div>
              <span class="font-bold text-gray-900">{{ metrics.avgOccupancy }}%</span>
            </div>
            
            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden -mt-2 mb-2">
              <div class="bg-blue-500 h-1.5 rounded-full" [style.width.%]="metrics.avgOccupancy"></div>
            </div>
            
            <div class="flex justify-between items-center pt-2">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-yellow-500"></div> Peak Hours
              </div>
              <span class="font-bold text-gray-900 text-sm bg-gray-100 px-2.5 py-1 rounded-md">{{ metrics.peakHours }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-2 border-t border-gray-50">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-green-500"></div> Monthly Revenue
              </div>
              <span class="font-bold text-green-600">\${{ metrics.monthlyRevenue }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-2">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-primary-500"></div> Total Bookings
              </div>
              <span class="font-bold text-primary-600">{{ metrics.totalBookings }}</span>
            </div>
            
            <div class="flex justify-between items-center pt-2 border-t border-gray-50">
              <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <div class="w-2 h-2 rounded-full bg-accent-500"></div> Completion Rate
              </div>
              <span class="font-bold text-accent-600">{{ metrics.completionRate }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden -mt-2">
              <div class="bg-accent-500 h-1.5 rounded-full" [style.width.%]="metrics.completionRate"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  private lotService = inject(ParkingLotService);
  private bookingService = inject(BookingService);
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private routerSubscription?: any;
  private authSubscription?: any;
  private dataSubscription?: any;

  stats = {
    totalLots: 0,
    activeBookings: 0,
    occupancyRate: 0,
    todayRevenue: 0
  };

  lots: any[] = [];
  recentBookings: any[] = [];
  metrics = {
    avgOccupancy: 0,
    peakHours: 'N/A',
    monthlyRevenue: 0,
    completionRate: 0,
    totalBookings: 0
  };

  showCreateForm = false;
  loading = false;
  isEditing = false;
  selectedLotId: number | null = null;

  lotForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required],
    totalSpots: [0, [Validators.required, Validators.min(1)]],
    hourlyRate: [5.0, [Validators.required, Validators.min(0)]],
    openTime: ['06:00'],
    closeTime: ['22:00'],
    managerId: [null]
  });

  ngOnInit() {
    // Subscribe to currentUser$ so that as soon as login completes or updates, dashboard loads instantly
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        setTimeout(() => this.loadDashboardData(), 50);
      }
    });

    // 3. Robust router subscription
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.includes('/manager/dashboard') || url.includes('/dashboard')) {
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  loadDashboardData() {
    const user = this.authService.currentUserValue;
    if (!user || !user.id) return;

    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.loading = true;
    this.dataSubscription = this.lotService.getManagerLots(user.id).subscribe({
      next: (response) => {
        // Robustly handle both Page<T> and T[] responses
        const rawLots = Array.isArray(response) ? response : (response.content || []);
        
        this.lots = rawLots.map((lot: any) => {
          const total = lot.totalSpots || 0;
          const available = lot.availableSpots !== undefined && lot.availableSpots !== null ? lot.availableSpots : total;
          const occupied = Math.max(0, total - available);
          const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
          
          let status = 'PENDING';
          if (lot.isApproved) {
            status = 'APPROVED';
          } else if (lot.rejectionReason) {
            status = 'REJECTED';
          }
          
          return {
            ...lot,
            status,
            occupiedSpots: occupied,
            occupancyRate: rate,
            todayRevenue: 0 // Will be calculated from real bookings below
          };
        });

        if (this.lots.length === 0) {
          this.recentBookings = [];
          this.calculateStats();
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        // Fetch bookings for each lot individually to avoid one failing lot blocking everything
        let processedLots = 0;
        let allBookings: any[] = [];

        this.lots.forEach(lot => {
          this.bookingService.getLotBookings(lot.lotId).pipe(
            catchError(() => of([]))
          ).subscribe(list => {
            const rawBookings = Array.isArray(list) ? list : (list.content || list || []);
            
            // Calculate revenue for this lot
            const lotBookings = rawBookings.filter((b: any) => b.status !== 'CANCELLED');
            lot.todayRevenue = lotBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || b.amount || 0), 0);

            // Add to global list for recent activity
            rawBookings.forEach((b: any) => {
              allBookings.push({
                lotName: lot.name,
                vehiclePlate: b.vehiclePlate || 'N/A',
                spotNumber: b.spotNumber || `Spot ${b.spotId}`,
                startTime: b.startTime,
                amount: b.totalAmount || b.amount || 0,
                status: b.status
              });
            });

            processedLots++;
            if (processedLots === this.lots.length) {
              this.finalizeData(allBookings);
            }
          });
        });
      },
      error: (err) => {
        console.error('Failed to load manager lots:', err);
        this.toastService.error('Failed to load parking lots');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private finalizeData(allBookings: any[]) {
    // Sort all bookings by startTime descending
    allBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    this.recentBookings = allBookings.slice(0, 5);

    // 1. Average Occupancy
    const lotsWithCapacity = this.lots.filter(l => (l.totalSpots || 0) > 0);
    this.metrics.avgOccupancy = lotsWithCapacity.length > 0
      ? Math.round(lotsWithCapacity.reduce((sum, l) => sum + (l.occupancyRate || 0), 0) / lotsWithCapacity.length)
      : 0;

    // 2. Peak Hours
    const hourCounts: { [key: number]: number } = {};
    allBookings.forEach(b => {
      if (b.startTime) {
        const hour = new Date(b.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    let peakHourStr = 'N/A';
    let maxCount = 0;
    let peakHourNum = -1;
    Object.keys(hourCounts).forEach(h => {
      const hr = parseInt(h);
      if (hourCounts[hr] > maxCount) {
        maxCount = hourCounts[hr];
        peakHourNum = hr;
      }
    });

    if (peakHourNum !== -1) {
      const isPm = peakHourNum >= 12;
      const displayHour = peakHourNum % 12 === 0 ? 12 : peakHourNum % 12;
      const period = isPm ? 'PM' : 'AM';
      peakHourStr = `${displayHour} ${period} - ${(peakHourNum + 1) % 12 || 12} ${ (peakHourNum + 1) % 24 >= 12 ? 'PM' : 'AM'}`;
    }
    this.metrics.peakHours = peakHourStr;

    // 3. Monthly Revenue
    const now = new Date();
    const currentMonthBookings = allBookings.filter(b => {
      if (!b.startTime || b.status === 'CANCELLED') return false;
      const d = new Date(b.startTime);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    this.metrics.monthlyRevenue = currentMonthBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    // 4. Total Bookings
    this.metrics.totalBookings = allBookings.length;

    // 5. Completion Rate
    const nonCancelled = allBookings.filter(b => b.status !== 'CANCELLED');
    const completed = allBookings.filter(b => b.status === 'COMPLETED');
    this.metrics.completionRate = nonCancelled.length > 0 
      ? Math.round((completed.length / nonCancelled.length) * 100)
      : 0;

    this.calculateStats();
    this.loading = false;
    this.cdr.detectChanges();
  }

  calculateStats() {
    this.stats.totalLots = this.lots.length;
    this.stats.activeBookings = this.lots.reduce((acc, lot) => acc + (lot.occupiedSpots || 0), 0);
    
    const totalCapacity = this.lots.reduce((acc, lot) => acc + (lot.totalSpots || 0), 0);
    this.stats.occupancyRate = totalCapacity > 0 ? Math.round((this.stats.activeBookings / totalCapacity) * 100) : 0;
    
    // Sum up the real computed lot revenues
    this.stats.todayRevenue = this.lots.reduce((acc, lot) => acc + (lot.todayRevenue || 0), 0);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.isEditing = false;
      this.selectedLotId = null;
    } else if (!this.isEditing) {
      this.lotForm.reset({
        managerId: this.authService.currentUserValue?.id,
        openTime: '06:00',
        closeTime: '22:00',
        latitude: 0,
        longitude: 0
      });
    }
  }

  createLot() {
    if (this.lotForm.invalid) return;

    this.loading = true;
    const lotData = {
      ...this.lotForm.value,
      managerId: this.authService.currentUserValue?.id,
      isApproved: this.isEditing ? this.lots.find(l => l.lotId === this.selectedLotId)?.isApproved : false,
      isOpen: this.isEditing ? this.lots.find(l => l.lotId === this.selectedLotId)?.isOpen : false
    };

    const action = this.isEditing 
      ? this.lotService.updateLot(this.selectedLotId!.toString(), lotData as any)
      : this.lotService.createLot(lotData as any);

    // Fix for ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      action.subscribe({
        next: (lot) => {
          this.toastService.success(this.isEditing ? 'Parking lot updated successfully!' : 'Parking lot submitted for approval!');
          this.showCreateForm = false;
          this.isEditing = false;
          this.selectedLotId = null;
          this.loadDashboardData();
          this.loading = false;
        },
        error: (err) => {
          console.error(`Failed to ${this.isEditing ? 'update' : 'create'} lot:`, err);
          this.toastService.error(err.error?.message || `Failed to ${this.isEditing ? 'update' : 'create'} lot`);
          this.loading = false;
        }
      });
    }, 0);
  }

  viewLot(lotId: number) {
    this.router.navigate(['/manager/lots']);
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
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleLotStatus(lot: any) {
    const action = lot.isOpen ? 'close' : 'open';
    if (confirm(`${action} this parking lot?`)) {
      this.lotService.toggleLotStatus(lot.lotId.toString(), !lot.isOpen).subscribe({
        next: () => {
          setTimeout(() => {
            this.toastService.success(`Parking lot ${action}ed successfully!`);
            this.loadDashboardData();
          }, 0);
        },
        error: (err) => {
          console.error(`Failed to ${action} lot:`, err);
          this.toastService.error(`Failed to ${action} lot`);
        }
      });
    }
  }
}