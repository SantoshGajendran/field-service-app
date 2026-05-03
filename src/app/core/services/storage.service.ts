import { Injectable } from '@angular/core';
import localforage from 'localforage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  constructor() {
    localforage.config({
      name: 'FieldServiceApp',
      storeName: 'field_service_db',
      description: 'Offline database for Field Service Application'
    });
  }

  public async setItem<T>(key: string, value: T): Promise<T> {
    return await localforage.setItem(key, value);
  }

  public async getItem<T>(key: string): Promise<T | null> {
    return await localforage.getItem<T>(key);
  }

  // Aliases for compatibility
  public async get<T>(key: string): Promise<T | null> {
    return this.getItem<T>(key);
  }

  public async set<T>(key: string, value: T): Promise<T> {
    return this.setItem<T>(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    return await localforage.removeItem(key);
  }

  public async clear(): Promise<void> {
    return await localforage.clear();
  }

  public async keys(): Promise<string[]> {
    return await localforage.keys();
  }
}
