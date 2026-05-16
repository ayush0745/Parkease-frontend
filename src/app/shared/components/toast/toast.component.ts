import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let msg of toastService.messages()" 
           class="toast-message" 
           [ngClass]="msg.type"
           (click)="toastService.remove(msg)">
        {{ msg.message }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast-message {
      padding: 15px 25px;
      border-radius: 12px;
      background: var(--bg-color);
      box-shadow: 5px 5px 10px var(--shadow-dark),
                 -5px -5px 10px var(--shadow-light);
      cursor: pointer;
      animation: slideIn 0.3s ease forwards;
    }
    .success {
      border-left: 4px solid #2ecc71;
    }
    .error {
      border-left: 4px solid #e74c3c;
    }
    .info {
      border-left: 4px solid #3498db;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
