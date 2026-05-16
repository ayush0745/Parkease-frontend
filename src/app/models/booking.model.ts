export interface BookingDTO {
  bookingId?: number;
  userId: number;
  lotId: number;
  spotId: number;
  vehiclePlate: string;
  vehicleType: string;
  bookingType: string;
  startTime: string;
  endTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface CreateBookingRequest {
  lotId: number;
  spotId?: number;
  vehiclePlate: string;
  vehicleType: string;
  bookingType: string;
  startTime: string;
  endTime: string;
}
