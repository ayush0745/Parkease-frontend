import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <div class="flex space-x-3">
          <select [(ngModel)]="selectedRole" (change)="loadUsers()" class="input-field">
            <option value="">All Roles</option>
            <option value="DRIVER">Drivers</option>
            <option value="MANAGER">Managers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <button (click)="loadUsers()" class="btn-secondary">Refresh</button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex flex-col items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p class="text-gray-600 mb-4">Loading users from API...</p>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="message()" class="p-4 rounded-lg" [ngClass]="{
        'bg-green-50 border border-green-200 text-green-800': messageType() === 'success',
        'bg-red-50 border border-red-200 text-red-800': messageType() === 'error'
      }">
        {{ message() }}
      </div>

      <!-- Users Table -->
      <div class="card overflow-hidden" *ngIf="!loading()">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngIf="users().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  No users found. {{ selectedRole ? 'Try selecting a different role.' : 'The system may be empty.' }}
                </td>
              </tr>
              <tr *ngFor="let user of users()" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ user.fullName || user.email }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                    <p class="text-xs text-gray-400">ID: {{ user.userId }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': user.role === 'DRIVER',
                          'bg-green-100 text-green-800': user.role === 'MANAGER',
                          'bg-purple-100 text-purple-800': user.role === 'ADMIN'
                        }">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="{
                          'bg-green-100 text-green-800': user.active !== false,
                          'bg-red-100 text-red-800': user.active === false
                        }">
                    {{ user.active !== false ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ user.createdAt ? (user.createdAt | date:'short') : 'Unknown' }}
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button *ngIf="user.role === 'DRIVER' && !isProcessing() && user.userId" 
                          (click)="promoteUser(user.userId, user)" 
                          class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Promote
                  </button>
                  <button *ngIf="user.role === 'MANAGER' && !isProcessing() && user.userId" 
                          (click)="demoteUser(user.userId, user)" 
                          class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                    Demote
                  </button>
                  <button *ngIf="!isProcessing() && user.userId"
                          (click)="toggleUserStatus(user.userId, user.active !== false, user)" 
                          class="text-sm hover:underline font-medium"
                          [ngClass]="{
                            'text-red-600': user.active !== false,
                            'text-green-600': user.active === false
                          }">
                    {{ user.active !== false ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button (click)="viewUserDetails(user.userId)" 
                          class="text-sm text-gray-600 hover:text-gray-800 font-medium">
                    View
                  </button>
                  <span *ngIf="isProcessing()" class="text-xs text-gray-400">Processing...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Details Modal -->
      <div *ngIf="selectedUser()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">User Details</h3>
            <button (click)="selectedUser.set(null)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-500">Full Name</label>
              <p class="text-gray-900">{{ selectedUser()?.fullName || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-gray-900">{{ selectedUser()?.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Role</label>
              <p class="text-gray-900">{{ selectedUser()?.role }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Status</label>
              <p class="text-gray-900">{{ selectedUser()?.active !== false ? 'Active' : 'Inactive' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">User ID</label>
              <p class="text-gray-900">{{ selectedUser()?.userId }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Joined</label>
              <p class="text-gray-900">{{ selectedUser()?.createdAt ? (selectedUser()?.createdAt | date:'medium') : 'Unknown' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  
  private authSubscription?: any;
  
  users = signal<any[]>([]);
  selectedRole = '';
  loading = signal(false);
  isProcessing = signal(false);
  selectedUser = signal<any>(null);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUsers();
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadUsers() {
    this.loading.set(true);
    this.clearMessage();
    
    this.authService.getUsersByRole(this.selectedRole).subscribe({
      next: (users) => {
        this.users.set(users || []);
      },
      complete: () => {
        this.loading.set(false);
        if (this.users().length === 0) {
          this.showMessage('No users found for selected role', 'error');
        }
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.users.set([]);
        this.loading.set(false);
        this.showMessage('Failed to load users from API', 'error');
      }
    });
  }


  promoteUser(userId: number, user: any) {
    if (!userId || userId === undefined) {
      this.showMessage('Invalid user ID', 'error');
      return;
    }
    
    if (confirm(`Promote ${user.fullName || user.email} to Manager?`)) {
      this.isProcessing.set(true);
      this.clearMessage();
      
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.authService.promoteToManager(userId).subscribe({
          next: (response) => {
            user.role = 'MANAGER';
            this.showMessage(`${user.fullName || user.email} promoted to Manager successfully!`, 'success');
            this.isProcessing.set(false);
          },
          error: (err) => {
            console.error('Failed to promote user:', err);
            this.showMessage(`Failed to promote user: ${err.message || 'Unknown error'}`, 'error');
            this.isProcessing.set(false);
          }
        });
      }, 0);
    }
  }

  demoteUser(userId: number, user: any) {
    if (!userId || userId === undefined) {
      this.showMessage('Invalid user ID', 'error');
      return;
    }
    
    if (confirm(`Demote ${user.fullName || user.email} to Driver?`)) {
      this.isProcessing.set(true);
      this.clearMessage();
      
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.authService.demoteToDriver(userId).subscribe({
          next: (response) => {
            user.role = 'DRIVER';
            this.showMessage(`${user.fullName || user.email} demoted to Driver successfully!`, 'success');
            this.isProcessing.set(false);
          },
          error: (err) => {
            console.error('Failed to demote user:', err);
            this.showMessage(`Failed to demote user: ${err.message || 'Unknown error'}`, 'error');
            this.isProcessing.set(false);
          }
        });
      }, 0);
    }
  }

  toggleUserStatus(userId: number, currentStatus: boolean, user: any) {
    if (!userId || userId === undefined) {
      this.showMessage('Invalid user ID', 'error');
      return;
    }
    
    const action = currentStatus ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${user.fullName || user.email}?`)) {
      this.isProcessing.set(true);
      this.clearMessage();
      
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.authService.setUserActive(userId, !currentStatus).subscribe({
          next: (response) => {
            user.active = !currentStatus;
            this.showMessage(`${user.fullName || user.email} ${action}d successfully!`, 'success');
            this.isProcessing.set(false);
          },
          error: (err) => {
            console.error(`Failed to ${action} user:`, err);
            this.showMessage(`Failed to ${action} user: ${err.message || 'Unknown error'}`, 'error');
            this.isProcessing.set(false);
          }
        });
      }, 0);
    }
  }

  viewUserDetails(userId: number) {
    this.selectedUser.set(this.users().find(u => u.userId === userId));
  }

  showMessage(text: string, type: 'success' | 'error') {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.message.set(text);
      this.messageType.set(type);
      // Auto-clear after 5 seconds
      setTimeout(() => this.clearMessage(), 5000);
    }, 0);
  }

  clearMessage() {
    this.message.set('');
  }

}