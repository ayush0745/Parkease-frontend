export interface OccupancyStats {
  date: string;
  occupancyRate: number;
}

export interface RevenueStats {
  date: string;
  totalRevenue: number;
}

export interface DashboardAnalytics {
  totalLots: number;
  totalSpots: number;
  totalBookings: number;
  totalRevenue: number;
  currentOccupancyRate: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  totalDrivers: number;
  totalManagers: number;
  totalLots: number;
  totalBookings: number;
  totalRevenue: number;
}
