import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-overlay" *ngIf="show">
      <div class="spinner neo-card"></div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(224, 229, 236, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 4px solid transparent;
      border-top-color: var(--primary-color);
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  @Input() show = false;
}
