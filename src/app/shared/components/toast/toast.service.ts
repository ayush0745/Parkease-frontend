import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  messages = signal<ToastMessage[]>([]);

  showSuccess(message: string) {
    this.show({ message, type: 'success' });
  }

  showError(message: string) {
    this.show({ message, type: 'error' });
  }

  showInfo(message: string) {
    this.show({ message, type: 'info' });
  }

  private show(toast: ToastMessage) {
    this.messages.update(msgs => [...msgs, toast]);
    setTimeout(() => this.remove(toast), 3000);
  }

  remove(toast: ToastMessage) {
    this.messages.update(msgs => msgs.filter(t => t !== toast));
  }
}
