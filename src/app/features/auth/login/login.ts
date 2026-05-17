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
    <div class="flex min-h-[86vh] items-center justify-center px-4 py-12">
      <div class="w-full max-w-md animate-fade-in-up">

        <!-- Logo + Heading -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
               style="background: linear-gradient(135deg, #4f46e5, #6366f1); box-shadow: 0 8px 24px rgba(79,70,229,0.32);">
            <span style="color:white; font-size:24px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif;">P</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900" style="letter-spacing:-0.03em;">Welcome back</h1>
          <p class="text-gray-500 mt-1.5 text-sm">Sign in to your ParkEase account</p>
        </div>

        <!-- Card -->
        <div class="card" style="padding: 2.25rem;">

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Error Banner -->
            <div *ngIf="errorMessage"
                 class="flex items-start gap-3 p-3.5 rounded-xl text-sm animate-fade-in"
                 style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b;">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errorMessage }}
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
              <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Please enter a valid email address.
              </div>
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
                <a routerLink="/forgot-password"
                   style="font-size:0.8rem; font-weight:500; color:#4f46e5; text-decoration:none; transition: opacity 150ms;"
                   onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">
                  Forgot password?
                </a>
              </div>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="input-field pr-11"
                  placeholder="••••••••"
                  autocomplete="current-password"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabindex="-1"
                >
                  <svg *ngIf="showPassword" class="h-4.5 w-4.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="btn-primary w-full py-3 mt-1 text-base"
              style="border-radius:10px;"
            >
              <svg *ngIf="isLoading" class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Signing in…' : 'Sign in' }}
            </button>

          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full" style="border-top: 1px solid #e2e8f0;"></div>
            </div>
            <div class="relative flex justify-center">
              <span style="padding: 0 0.75rem; background:#fff; font-size:0.8rem; color:#94a3b8; font-weight:500;">Or continue with</span>
            </div>
          </div>

          <!-- Google Sign-In -->
          <div>
            <div id="google-signin-btn" class="flex justify-center" [class.hidden]="isMockGoogle"></div>

            <button *ngIf="isMockGoogle" type="button" (click)="simulateGoogleLogin()"
                    class="w-full flex justify-center items-center gap-2.5 py-2.5 px-4 text-sm font-semibold text-gray-700 transition-all"
                    style="background:#fff; border:1.5px solid #e2e8f0; border-radius:10px; cursor:pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.06);"
                    onmouseover="this.style.borderColor='#a5b4fc'; this.style.background='#f8faff';"
                    onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#fff';">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>

            <div *ngIf="googleError" class="mt-3 text-red-500 text-xs text-center">{{ googleError }}</div>
          </div>

        </div>

        <!-- Register Link -->
        <p class="mt-6 text-center text-sm text-gray-500">
          Don't have an account?
          <a routerLink="/register"
             style="font-weight:600; color:#4f46e5; text-decoration:none; margin-left:4px;"
             onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
            Create one free
          </a>
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
  isMockGoogle = false;
  showPassword = false;

  ngOnInit() {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    if (environment.googleClientId === 'YOUR_GOOGLE_CLIENT_ID' || !environment.googleClientId) {
      this.isMockGoogle = true;
      return;
    }

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

  simulateGoogleLogin() {
    // Generate a mock JWT for development
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      sub: "mock-google-id-" + Math.floor(Math.random() * 10000),
      email: "google.user@example.com",
      name: "Mock Google User"
    }));
    const signature = "mock-signature";
    this.handleGoogleCredential(`${header}.${payload}.${signature}`);
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
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials and try again.';
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
