export interface PhotoData {
  url: string;
  path: string;
  timestamp: Date;
  isLocal?: boolean;
  base64Data?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

export interface CheckInData {
  location: LocationData;
  timestamp: Date;
}

export interface CheckOutData {
  location: LocationData;
  timestamp: Date;
  duration?: number; // Duration in minutes
  distance?: number; // Distance in meters
}

export interface WorkOrder {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  equipment_id: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  photos?: PhotoData[];
  signature_url?: string;
  check_in?: CheckInData;
  check_out?: CheckOutData;
  work_order_location?: LocationData; // Location of the work site
}
