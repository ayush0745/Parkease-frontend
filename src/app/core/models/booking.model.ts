export interface Booking {
  id?: string;
  userId: string;
  lotId: string;
  spotId: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  status: 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalAmount?: number;
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}

export interface BookingRequest {
  lotId: number;
  spotId: number;
  vehiclePlate: string;
  vehicleType: string;
  bookingType: string;
  startTime: string;
  endTime: string;
}

export interface FareEstimate {
  amount: number;
  currency: string;
  hours: number;
}
