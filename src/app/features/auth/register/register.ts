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
    <div class="flex min-h-[86vh] items-center justify-center px-4 py-12">
      <div class="w-full max-w-md animate-fade-in-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
               style="background: linear-gradient(135deg, #4f46e5, #6366f1); box-shadow: 0 8px 24px rgba(79,70,229,0.32);">
            <span style="color:white; font-size:24px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif;">P</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900" style="letter-spacing:-0.03em;">Create an account</h1>
          <p class="text-gray-500 mt-1.5 text-sm">Join ParkEase today — find and book parking in seconds.</p>
        </div>

        <div class="card" style="padding: 2.25rem;">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Error Banner -->
            <div *ngIf="errorMessage"
                 class="flex items-start gap-3 p-3.5 rounded-xl text-sm animate-fade-in"
                 style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b;">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errorMessage }}
            </div>

            <!-- Full name row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-1.5">First name</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="input-field"
                  placeholder="John"
                  autocomplete="given-name"
                >
                <div *ngIf="registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid"
                     class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  First name required.
                </div>
              </div>
              <div>
                <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-1.5">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="input-field"
                  placeholder="Doe"
                  autocomplete="family-name"
                >
                <div *ngIf="registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid"
                     class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  Last name required.
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-field"
                placeholder="you@example.com"
                autocomplete="email"
              >
              <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Please enter a valid email address.
              </div>
            </div>

            <!-- Phone (optional) -->
            <div>
              <label for="phone" class="block text-sm font-semibold text-gray-700 mb-1.5">
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
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="input-field pr-11"
                  placeholder="••••••••"
                  autocomplete="new-password"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabindex="-1"
                >
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 mt-1.5">Must be at least 6 characters.</p>
              <div *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Password must be at least 6 characters.
              </div>
            </div>

            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="btn-primary w-full py-3 mt-1 text-base"
              style="border-radius:10px;"
            >
              <svg *ngIf="isLoading" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Creating account…' : 'Create account' }}
            </button>
          </form>
        </div>

        <p class="mt-6 text-center text-sm text-gray-500">
          Already have an account?
          <a routerLink="/login"
             style="font-weight:600; color:#4f46e5; text-decoration:none; margin-left:4px;"
             onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
            Sign in
          </a>
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
  showPassword = false;

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
