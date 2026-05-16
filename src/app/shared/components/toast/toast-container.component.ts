import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      <div
        *ngFor="let toast of toastService.toasts(); trackBy: trackByToast"
        class="transform transition-all duration-300 ease-in-out animate-slide-in-right"
        [ngClass]="getToastClasses(toast.type)"
      >
        <div class="flex items-start space-x-3 p-4 rounded-xl shadow-premium backdrop-blur-md">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">
              <ng-container [ngSwitch]="toast.type">
                <span *ngSwitchCase="'success'">✓</span>
                <span *ngSwitchCase="'error'">✕</span>
                <span *ngSwitchCase="'warning'">!</span>
                <span *ngSwitchCase="'info'">i</span>
              </ng-container>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-white mb-1">
              {{ toast.title }}
            </h4>
            <p *ngIf="toast.message" class="text-sm text-white/90">
              {{ toast.message }}
            </p>
          </div>

          <!-- Action Button -->
          <button
            *ngIf="toast.action"
            (click)="handleAction(toast)"
            class="text-sm font-medium text-white/90 hover:text-white underline"
          >
            {{ toast.action.label }}
          </button>

          <!-- Close Button -->
          <button
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div
          *ngIf="toast.duration && toast.duration > 0"
          class="h-1 bg-white/20 rounded-b-xl overflow-hidden"
        >
          <div
            class="h-full bg-white/40 rounded-b-xl animate-progress"
            [style.animation-duration]="toast.duration + 'ms'"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }
    
    .animate-progress {
      animation: progress linear forwards;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  trackByToast(index: number, toast: Toast): string {
    return toast.id;
  }

  getToastClasses(type: Toast['type']): string {
    const baseClasses = 'relative overflow-hidden';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-gradient-to-r from-accent-500 to-accent-600`;
      case 'error':
        return `${baseClasses} bg-gradient-to-r from-red-500 to-red-600`;
      case 'warning':
        return `${baseClasses} bg-gradient-to-r from-yellow-500 to-orange-500`;
      case 'info':
        return `${baseClasses} bg-gradient-to-r from-primary-500 to-primary-600`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-500 to-gray-600`;
    }
  }

  handleAction(toast: Toast): void {
    if (toast.action) {
      toast.action.handler();
      this.toastService.remove(toast.id);
    }
  }
}