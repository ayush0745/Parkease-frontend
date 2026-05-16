export interface ParkingLot {
  id?: number;
  name: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  totalSpots: number;
  availableSpots?: number;
  occupiedSpots?: number;
  hourlyRate: number;
  description?: string;
  amenities?: string[];
  openingTime?: string;
  closingTime?: string;
  isOpen?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  managerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Spot {
  id?: number;
  spotNumber: string;
  lotId: number;
  vehicleType?: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'SUV';
  status?: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';
  isEVCharging?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SpotAvailability {
  spotId: number;
  spotNumber: string;
  isAvailable: boolean;
  currentBookingId?: number;
  nextAvailableTime?: Date;
}