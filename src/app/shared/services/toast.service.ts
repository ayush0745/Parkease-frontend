import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  success(title: string, message?: string, duration?: number): void {
    this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message?: string, duration?: number): void {
    this.show({
      type: 'error',
      title,
      message,
      duration: duration || 7000 // Errors stay longer
    });
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message?: string, duration?: number): void {
    this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}