export interface ParkingLotDTO {
  lotId?: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpots: number;
  availableSpots?: number;
  baseRatePerHour: number;
  status?: string;
}

export interface ParkingSpotDTO {
  spotId?: number;
  lotId: number;
  spotNumber: string;
  spotType: string;
  isEvCharging: boolean;
  isAccessible: boolean;
  status: string;
}
