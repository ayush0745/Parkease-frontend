export interface PaymentDTO {
  paymentId?: number;
  bookingId: number;
  userId: number;
  amount: number;
  paymentMode: string;
  paymentStatus: string;
  transactionId?: string;
  paymentTime?: string;
}
