import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationHistoryEntry, LocationHistory } from '../models/location-history.model';

@Injectable({
  providedIn: 'root'
})
export class LocationHistoryService {
  private readonly STORAGE_KEY = 'location_history';
  private historySubject = new BehaviorSubject<LocationHistoryEntry[]>([]);
  public history$ = this.historySubject.asObservable();

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const entries = JSON.parse(stored);
        this.historySubject.next(entries);
      } catch (error) {
        console.error('Error loading location history:', error);
        this.historySubject.next([]);
      }
    }
  }

  private saveHistory(entries: LocationHistoryEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    this.historySubject.next(entries);
  }

  addEntry(entry: LocationHistoryEntry): void {
    const currentHistory = this.historySubject.value;
    const updatedHistory = [...currentHistory, entry];
    this.saveHistory(updatedHistory);
  }

  getHistoryForWorkOrder(workOrderId: string): LocationHistory {
    const entries = this.historySubject.value.filter(
      entry => entry.workOrderId === workOrderId
    );

    // Sort by timestamp
    entries.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate totals
    let totalDuration = 0;
    let totalDistance = 0;

    entries.forEach(entry => {
      if (entry.type === 'CHECK_OUT') {
        totalDuration += entry.duration || 0;
        totalDistance += entry.distance || 0;
      }
    });

    return {
      workOrderId,
      entries,
      totalDuration,
      totalDistance
    };
  }

  getAllHistory(): LocationHistoryEntry[] {
    return this.historySubject.value;
  }

  clearHistoryForWorkOrder(workOrderId: string): void {
    const currentHistory = this.historySubject.value;
    const updatedHistory = currentHistory.filter(
      entry => entry.workOrderId !== workOrderId
    );
    this.saveHistory(updatedHistory);
  }

  clearAllHistory(): void {
    this.saveHistory([]);
  }

  deleteEntry(entryId: string): void {
    const currentHistory = this.historySubject.value;
    const updatedHistory = currentHistory.filter(entry => entry.id !== entryId);
    this.saveHistory(updatedHistory);
  }

  // Get entries within a date range
  getEntriesInRange(startDate: Date, endDate: Date): LocationHistoryEntry[] {
    return this.historySubject.value.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  // Get entries by type
  getEntriesByType(type: 'CHECK_IN' | 'CHECK_OUT'): LocationHistoryEntry[] {
    return this.historySubject.value.filter(entry => entry.type === type);
  }

  // Export history as JSON
  exportHistory(): string {
    return JSON.stringify(this.historySubject.value, null, 2);
  }

  // Import history from JSON
  importHistory(jsonData: string): boolean {
    try {
      const entries = JSON.parse(jsonData);
      if (Array.isArray(entries)) {
        this.saveHistory(entries);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  // Get statistics
  getStatistics(): {
    totalCheckIns: number;
    totalCheckOuts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  } {
    const entries = this.historySubject.value;
    const checkIns = entries.filter(e => e.type === 'CHECK_IN').length;
    const checkOuts = entries.filter(e => e.type === 'CHECK_OUT');

    let totalDuration = 0;
    let totalDistance = 0;

    checkOuts.forEach(entry => {
      totalDuration += entry.duration || 0;
      totalDistance += entry.distance || 0;
    });

    return {
      totalCheckIns: checkIns,
      totalCheckOuts: checkOuts.length,
      totalDuration,
      totalDistance,
      averageDuration: checkOuts.length > 0 ? totalDuration / checkOuts.length : 0,
      averageDistance: checkOuts.length > 0 ? totalDistance / checkOuts.length : 0
    };
  }
}
