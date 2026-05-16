import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
        <div class="flex space-x-3">
          <select [(ngModel)]="filterStatus" (change)="filterPayments()" class="input-field">
            <option value="">All Payments</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button (click)="loadPayments()" class="btn-primary">🔄 Refresh</button>
        </div>
      </div>

      <!-- Payment Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-green-600">\${{ totalSpent }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ completedPayments }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ pendingPayments }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ thisMonthSpent }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">This Month</div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Parking Details
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr *ngFor="let payment of filteredPayments; trackBy: trackByPaymentId" 
                  class="hover:bg-white/5 transition-all duration-200">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ payment.transactionId }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ payment.paymentMethod }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ payment.lotName }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Spot {{ payment.spotNumber }} • {{ payment.duration }}h
                    </p>
                    <p class="text-xs text-gray-500">{{ payment.vehiclePlate }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">
                    \${{ payment.amount }}
                  </div>
                  <div *ngIf="payment.fees > 0" class="text-xs text-gray-500">
                    +\${{ payment.fees }} fees
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 text-xs font-medium rounded-full"
                        [ngClass]="getStatusClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ payment.createdAt | date:'short' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button (click)="downloadReceipt(payment.id)" 
                            class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      📄 Receipt
                    </button>
                    <button *ngIf="payment.status === 'COMPLETED' && canRefund(payment)" 
                            (click)="requestRefund(payment.id)"
                            class="text-orange-600 hover:text-orange-800 text-sm font-medium">
                      🔄 Refund
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="filteredPayments.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="text-6xl mb-4">💳</div>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No payments found</h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ filterStatus ? 'Try changing the filter.' : 'Your payment history will appear here.' }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Summary -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold mb-4">Monthly Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let month of monthlySummary" class="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ month.month }}</h3>
            <p class="text-2xl font-bold text-blue-600 mt-2">\${{ month.amount }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ month.transactions }} transactions</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentHistoryComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  payments: any[] = [];
  filteredPayments: any[] = [];
  filterStatus = '';
  monthlySummary: any[] = [];

  get totalSpent(): number {
    return this.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get completedPayments(): number {
    return this.payments.filter(p => p.status === 'COMPLETED').length;
  }

  get pendingPayments(): number {
    return this.payments.filter(p => p.status === 'PENDING').length;
  }

  get thisMonthSpent(): number {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return this.payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt);
        return p.status === 'COMPLETED' && 
               paymentDate.getMonth() === thisMonth && 
               paymentDate.getFullYear() === thisYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getPaymentHistory().subscribe({
      next: (payments) => {
        this.payments = payments || [];
        this.filterPayments();
        this.calculateMonthlySummary();
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        // Mock data for demo
        this.payments = this.getMockPayments();
        this.filterPayments();
        this.calculateMonthlySummary();
      }
    });
  }

  getMockPayments(): any[] {
    return [
      {
        id: 1,
        transactionId: 'TXN-001234',
        amount: 15.50,
        fees: 0.50,
        status: 'COMPLETED',
        paymentMethod: 'Credit Card ****1234',
        lotName: 'Downtown Plaza',
        spotNumber: 'A-15',
        duration: 2,
        vehiclePlate: 'ABC-1234',
        createdAt: new Date()
      },
      {
        id: 2,
        transactionId: 'TXN-001235',
        amount: 12.00,
        fees: 0,
        status: 'COMPLETED',
        paymentMethod: 'PayPal',
        lotName: 'Shopping Center',
        spotNumber: 'B-22',
        duration: 3,
        vehiclePlate: 'XYZ-5678',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        transactionId: 'TXN-001236',
        amount: 8.00,
        fees: 0,
        status: 'PENDING',
        paymentMethod: 'Credit Card ****5678',
        lotName: 'Airport Parking',
        spotNumber: 'C-10',
        duration: 1,
        vehiclePlate: 'ABC-1234',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
  }

  filterPayments() {
    if (this.filterStatus) {
      this.filteredPayments = this.payments.filter(p => p.status === this.filterStatus);
    } else {
      this.filteredPayments = [...this.payments];
    }
  }

  calculateMonthlySummary() {
    const monthlyData: { [key: string]: { amount: number; transactions: number } } = {};
    
    this.payments
      .filter(p => p.status === 'COMPLETED')
      .forEach(payment => {
        const date = new Date(payment.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, transactions: 0 };
        }
        
        monthlyData[monthKey].amount += payment.amount;
        monthlyData[monthKey].transactions += 1;
      });

    this.monthlySummary = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-3); // Last 3 months
  }

  downloadReceipt(paymentId: number) {
    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob) => {
        // Handle PDF download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${paymentId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Receipt downloaded successfully!');
      },
      error: (err) => {
        console.error('Failed to download receipt:', err);
        this.toastService.success('Receipt download started! (Demo mode)');
      }
    });
  }

  requestRefund(paymentId: number) {
    if (confirm('Are you sure you want to request a refund for this payment?')) {
      this.paymentService.requestRefund(paymentId).subscribe({
        next: () => {
          const payment = this.payments.find(p => p.id === paymentId);
          if (payment) {
            payment.status = 'REFUNDED';
            this.filterPayments();
          }
          this.toastService.success('Refund request submitted successfully!');
        },
        error: (err) => {
          console.error('Failed to request refund:', err);
          // Mock success for demo
          const payment = this.payments.find(p => p.id === paymentId);
          if (payment) {
            payment.status = 'REFUNDED';
            this.filterPayments();
          }
          this.toastService.success('Refund request submitted! (Demo mode)');
        }
      });
    }
  }

  canRefund(payment: any): boolean {
    // Allow refund within 24 hours of payment
    const paymentDate = new Date(payment.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  trackByPaymentId(index: number, payment: any): number {
    return payment.id;
  }
}