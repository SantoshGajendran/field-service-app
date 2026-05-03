export interface LocationHistoryEntry {
  id: string;
  workOrderId: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  timestamp: Date;
  address?: string;
  duration?: number; // For check-out only (minutes)
  distance?: number; // For check-out only (meters)
  notes?: string;
}

export interface LocationHistory {
  workOrderId: string;
  entries: LocationHistoryEntry[];
  totalDuration: number; // Total time in minutes
  totalDistance: number; // Total distance in meters
}
