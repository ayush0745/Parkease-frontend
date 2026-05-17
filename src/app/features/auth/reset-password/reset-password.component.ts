import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex min-h-[86vh] items-center justify-center px-4 py-12">
      <div class="w-full max-w-md animate-fade-in-up">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
               style="background: linear-gradient(135deg, #4f46e5, #6366f1); box-shadow: 0 8px 24px rgba(79,70,229,0.32);">
            <span style="color:white; font-size:24px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif;">P</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900" style="letter-spacing:-0.03em;">Reset password</h1>
          <p class="text-gray-500 mt-1.5 text-sm">Enter the reset token sent to your email and your new password.</p>
        </div>

        <div class="card" style="padding: 2.25rem;">
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="token" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Reset Token
              </label>
              <input id="token" type="text" formControlName="token" placeholder="Paste your token here"
                     class="input-field">
              <div *ngIf="resetForm.get('token')?.invalid && resetForm.get('token')?.touched"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Token is required.
              </div>
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div class="relative">
                <input id="newPassword" [type]="showPassword ? 'text' : 'password'" formControlName="newPassword" placeholder="••••••••"
                       class="input-field pr-11">
                <button type="button" (click)="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" tabindex="-1">
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div *ngIf="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Password must be at least 6 characters.
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div class="relative">
                <input id="confirmPassword" [type]="showConfirmPassword ? 'text' : 'password'" formControlName="confirmPassword" placeholder="••••••••"
                       class="input-field pr-11">
                <button type="button" (click)="showConfirmPassword = !showConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" tabindex="-1">
                  <svg *ngIf="showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg *ngIf="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div *ngIf="resetForm.errors?.['mismatch'] && resetForm.get('confirmPassword')?.touched"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Passwords do not match.
              </div>
            </div>

            <button type="submit" [disabled]="resetForm.invalid || loading"
                    class="btn-primary w-full py-3 mt-1 text-base" style="border-radius:10px;">
              <svg *ngIf="loading" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Resetting password…' : 'Reset Password' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <a routerLink="/login"
               style="font-weight:600; color:#4f46e5; text-decoration:none; font-size:0.875rem;"
               onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
              Back to Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  resetForm: FormGroup = this.fb.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading = true;
    const data = {
      token: this.resetForm.value.token,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Password reset successful. Please sign in with your new password.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Invalid or expired token.');
      }
    });
  }
}
