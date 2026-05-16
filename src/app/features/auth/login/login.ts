import { Component, inject, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex min-h-[80vh] items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
          <p class="text-gray-500 mt-2">Log in to your ParkEase account</p>
        </div>

        <div class="card">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div *ngIf="errorMessage" class="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

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
              <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="text-red-500 text-xs mt-1">
                Please enter a valid email address.
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <a routerLink="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="input-field"
                placeholder="••••••••"
                autocomplete="current-password"
              >
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full btn-primary py-3 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div class="mt-6">
              <!-- Google Sign-In button rendered by GSI -->
              <div id="google-signin-btn" class="flex justify-center"></div>

              <div *ngIf="googleError" class="mt-2 text-red-500 text-xs text-center">{{ googleError }}</div>
            </div>
          </div>
        </div>

        <p class="mt-8 text-center text-sm text-gray-600">
          Not a member?
          <a routerLink="/register" class="font-medium text-primary-600 hover:text-primary-500">Sign up now</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ngZone = inject(NgZone);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  isLoading = false;
  errorMessage = '';
  googleError = '';

  ngOnInit() {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    if (typeof google === 'undefined') {
      // GSI script not loaded yet — retry after a short delay
      setTimeout(() => this.initGoogleSignIn(), 500);
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      }
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large', width: 400, text: 'continue_with' }
    );
  }

  private handleGoogleCredential(credential: string) {
    this.isLoading = true;
    this.googleError = '';

    this.authService.googleLogin(credential).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.googleError = err.message || err.error?.message || 'Google sign-in failed. Please try again.';
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || err.error?.message || 'Login failed. Please check your credentials and try again.';
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
      this.router.navigate(['/']);
    }
  }
}
