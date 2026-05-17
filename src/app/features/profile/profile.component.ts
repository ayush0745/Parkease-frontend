import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Profile Update Card -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" formControlName="fullName"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <div *ngIf="profileForm.get('fullName')?.touched && profileForm.get('fullName')?.invalid" class="text-red-500 text-sm mt-1">
                  Full name is required.
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" formControlName="email" readonly
                       class="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                <p class="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input type="tel" formControlName="phone"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              </div>

              <button type="submit" [disabled]="profileForm.invalid || updatingProfile"
                      class="w-full btn-primary disabled:opacity-50 flex items-center justify-center">
                <span *ngIf="updatingProfile" class="animate-spin mr-2">⏳</span>
                Update Profile
              </button>
            </div>
          </form>
        </div>

        <!-- Password Update Card -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input type="password" formControlName="currentPassword"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" formControlName="newPassword"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" formControlName="confirmPassword"
                       class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <div *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched" class="text-red-500 text-sm mt-1">
                  Passwords do not match.
                </div>
              </div>

              <button type="submit" [disabled]="passwordForm.invalid || updatingPassword"
                      class="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 flex items-center justify-center">
                <span *ngIf="updatingPassword" class="animate-spin mr-2">⏳</span>
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  profileForm: FormGroup;
  passwordForm: FormGroup;

  updatingProfile = false;
  updatingPassword = false;

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.fetchProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone
        });
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        // Fallback to local storage user
        const user = this.authService.currentUserValue;
        if (user) {
          this.profileForm.patchValue({
            fullName: user.fullName,
            email: user.email
          });
        }
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.updatingProfile = true;
    const data = {
      ...this.profileForm.getRawValue()
    };

    this.authService.updateProfile(data).subscribe({
      next: () => {
        this.toastService.success('Profile updated successfully');
        this.updatingProfile = false;
      },
      error: (err) => {
        console.error('Profile update failed', err);
        this.toastService.error(err.error?.message || 'Failed to update profile');
        this.updatingProfile = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.updatingPassword = true;
    const data = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(data).subscribe({
      next: () => {
        this.toastService.success('Password changed successfully');
        this.passwordForm.reset();
        this.updatingPassword = false;
      },
      error: (err) => {
        console.error('Password change failed', err);
        this.toastService.error(err.error?.message || 'Failed to change password');
        this.updatingPassword = false;
      }
    });
  }
}
