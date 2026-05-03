import { Injectable, inject } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { BehaviorSubject } from 'rxjs';
import { LocationHistoryService } from './location-history.service';
import { LocationHistoryEntry } from '../models/location-history.model';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface CheckInData {
  location: LocationData;
  timestamp: Date;
  address?: string;
}

export interface CheckOutData {
  location: LocationData;
  timestamp: Date;
  address?: string;
  duration?: number; // Duration in minutes
  distance?: number; // Distance in meters
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationHistoryService = inject(LocationHistoryService);

  private currentLocationSubject = new BehaviorSubject<LocationData | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private isTrackingSubject = new BehaviorSubject<boolean>(false);
  public isTracking$ = this.isTrackingSubject.asObservable();

  constructor() {}

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.requestPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permission = await Geolocation.checkPermissions();
      return permission.location === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
      };

      this.currentLocationSubject.next(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      throw new Error('Failed to get current location. Please check GPS and permissions.');
    }
  }

  async checkIn(workOrderId: string): Promise<CheckInData> {
    const location = await this.getCurrentLocation();

    const checkInData: CheckInData = {
      location,
      timestamp: new Date()
    };

    // Store check-in data in localStorage for offline support
    localStorage.setItem(`checkin_${workOrderId}`, JSON.stringify(checkInData));

    // Add to history
    const historyEntry: LocationHistoryEntry = {
      id: crypto.randomUUID(),
      workOrderId,
      type: 'CHECK_IN',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      },
      timestamp: new Date()
    };
    this.locationHistoryService.addEntry(historyEntry);

    return checkInData;
  }

  async checkOut(workOrderId: string): Promise<CheckOutData> {
    const location = await this.getCurrentLocation();

    // Get check-in data
    const checkInDataStr = localStorage.getItem(`checkin_${workOrderId}`);
    if (!checkInDataStr) {
      throw new Error('No check-in data found. Please check in first.');
    }

    const checkInData: CheckInData = JSON.parse(checkInDataStr);
    const checkOutTime = new Date();
    const checkInTime = new Date(checkInData.timestamp);

    // Calculate duration in minutes
    const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000);

    // Calculate distance in meters
    const distance = this.calculateDistance(
      checkInData.location.latitude,
      checkInData.location.longitude,
      location.latitude,
      location.longitude
    );

    const checkOutData: CheckOutData = {
      location,
      timestamp: checkOutTime,
      duration,
      distance
    };

    // Store check-out data
    localStorage.setItem(`checkout_${workOrderId}`, JSON.stringify(checkOutData));

    // Clear check-in data
    localStorage.removeItem(`checkin_${workOrderId}`);

    // Add to history
    const historyEntry: LocationHistoryEntry = {
      id: crypto.randomUUID(),
      workOrderId,
      type: 'CHECK_OUT',
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      },
      timestamp: checkOutTime,
      duration,
      distance
    };
    this.locationHistoryService.addEntry(historyEntry);

    return checkOutData;
  }

  getCheckInData(workOrderId: string): CheckInData | null {
    const data = localStorage.getItem(`checkin_${workOrderId}`);
    return data ? JSON.parse(data) : null;
  }

  getCheckOutData(workOrderId: string): CheckOutData | null {
    const data = localStorage.getItem(`checkout_${workOrderId}`);
    return data ? JSON.parse(data) : null;
  }

  isCheckedIn(workOrderId: string): boolean {
    return localStorage.getItem(`checkin_${workOrderId}`) !== null;
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
  }

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    } else {
      return `${(meters / 1000).toFixed(2)}km`;
    }
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  // Get Google Maps URL for location
  getMapUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  // Get directions URL from current location to destination
  getDirectionsUrl(destLat: number, destLon: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}`;
  }

  // Reverse geocoding (optional - requires API key)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    // This is a placeholder - you would need to integrate with a geocoding service
    // like Google Maps Geocoding API or OpenStreetMap Nominatim
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // Watch position for real-time tracking (use sparingly - battery intensive)
  async startTracking(): Promise<string> {
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Error watching position:', err);
          return;
        }

        if (position) {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };
          this.currentLocationSubject.next(locationData);
        }
      }
    );

    this.isTrackingSubject.next(true);
    return watchId;
  }

  async stopTracking(watchId: string): Promise<void> {
    await Geolocation.clearWatch({ id: watchId });
    this.isTrackingSubject.next(false);
  }
}
