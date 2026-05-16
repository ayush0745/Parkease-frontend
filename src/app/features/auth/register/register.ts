import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex min-h-[80vh] items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
          <p class="text-gray-500 mt-2">Join ParkEase today — find and book parking in seconds.</p>
        </div>

        <div class="card">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div *ngIf="errorMessage" class="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <!-- Full name row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="input-field"
                  placeholder="John"
                  autocomplete="given-name"
                >
                <div *ngIf="registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid"
                     class="text-red-500 text-xs mt-1">First name is required.</div>
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="input-field"
                  placeholder="Doe"
                  autocomplete="family-name"
                >
                <div *ngIf="registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid"
                     class="text-red-500 text-xs mt-1">Last name is required.</div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-field"
                placeholder="you@example.com"
                autocomplete="email"
              >
              <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                   class="text-red-500 text-xs mt-1">Please enter a valid email address.</div>
            </div>

            <!-- Phone (optional) -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                Phone <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="input-field"
                placeholder="+91 98765 43210"
                autocomplete="tel"
              >
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="input-field"
                placeholder="••••••••"
                autocomplete="new-password"
              >
              <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
              <div *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                   class="text-red-500 text-xs mt-1">Password must be at least 6 characters.</div>
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full btn-primary py-3 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>
        </div>

        <p class="mt-8 text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/login" class="font-medium text-primary-600 hover:text-primary-500">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    password:  ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, phone, password } = this.registerForm.value;
    const registerData: RegisterRequest = {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      password,
      phone: phone || undefined
    };

    // register() stores the token via tap — navigate directly with the response role
    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || err.message || 'Registration failed. Please try again.';
      }
    });
  }

  private redirectByRole(role: string) {
    if (role === 'DRIVER') {
      this.router.navigate(['/driver/dashboard']);
    } else if (role === 'MANAGER') {
      this.router.navigate(['/manager/dashboard']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
