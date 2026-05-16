export interface Vehicle {
  vehicleId?: number;
  ownerId?: number;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER' | 'HEAVY';
  isEV?: boolean;
  registeredAt?: string;
  isActive?: boolean;
}

export interface VehicleRequest {
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  vehicleType: string;
  isEV: boolean;
}
