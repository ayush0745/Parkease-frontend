export interface Payment {
  id?: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CARD' | 'UPI' | 'WALLET' | 'CASH';
  transactionId?: string;
  createdAt?: string;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: string;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}
