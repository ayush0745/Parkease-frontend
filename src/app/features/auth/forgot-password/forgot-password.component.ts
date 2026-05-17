import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-forgot-password',
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
          <h1 class="text-3xl font-bold text-gray-900" style="letter-spacing:-0.03em;">Forgot password?</h1>
          <p class="text-gray-500 mt-1.5 text-sm">Enter your email address to receive a password reset token.</p>
        </div>

        <div class="card" style="padding: 2.25rem;">
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                     class="input-field" autocomplete="email">
              <div *ngIf="forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched"
                   class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Please enter a valid email address.
              </div>
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || loading"
                    class="btn-primary w-full py-3 mt-1 text-base" style="border-radius:10px;">
              <svg *ngIf="loading" class="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Sending reset token…' : 'Send Reset Token' }}
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = false;

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Reset token sent to your email.');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || err.message || 'Failed to process request. Please try again.');
      }
    });
  }
}
