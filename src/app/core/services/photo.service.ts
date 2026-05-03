import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { SupabaseService } from './supabase.service';
import { NetworkService } from './network.service';
import { BehaviorSubject } from 'rxjs';

export interface PhotoData {
  url: string;
  path: string;
  timestamp: Date;
  isLocal?: boolean;
  base64Data?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private uploadProgressSubject = new BehaviorSubject<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private networkService: NetworkService
  ) {}

  async takePhoto(): Promise<Photo> {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    return photo;
  }

  async pickFromGallery(): Promise<Photo> {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    return photo;
  }

  async uploadPhoto(photo: Photo, workOrderId: string): Promise<PhotoData> {
    if (!photo.base64String) {
      throw new Error('No photo data available');
    }

    const timestamp = Date.now();
    const fileName = `${workOrderId}/${timestamp}.${photo.format}`;

    // If offline, store locally
    if (!this.networkService.currentStatus) {
      const localUrl = `data:image/${photo.format};base64,${photo.base64String}`;
      return {
        url: localUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: true,
        base64Data: photo.base64String
      };
    }

    // If online, upload to Supabase with progress tracking
    try {
      const blob = this.base64ToBlob(photo.base64String, `image/${photo.format}`);
      const fileSize = blob.size;

      // Simulate progress for small files (Supabase doesn't provide native progress)
      this.uploadProgressSubject.next({ loaded: 0, total: fileSize, percentage: 0 });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        const current = this.uploadProgressSubject.value;
        if (current.percentage < 90) {
          const newPercentage = Math.min(current.percentage + 10, 90);
          this.uploadProgressSubject.next({
            loaded: (fileSize * newPercentage) / 100,
            total: fileSize,
            percentage: newPercentage
          });
        }
      }, 100);

      const { data, error } = await this.supabase.uploadFile(
        'work-order-photos',
        fileName,
        blob
      );

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Complete progress
      this.uploadProgressSubject.next({ loaded: fileSize, total: fileSize, percentage: 100 });

      const { data: urlData } = this.supabase.getPublicUrl('work-order-photos', fileName);

      // Reset progress after a short delay
      setTimeout(() => {
        this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });
      }, 1000);

      return {
        url: urlData.publicUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: false
      };
    } catch (error) {
      // Reset progress on error
      this.uploadProgressSubject.next({ loaded: 0, total: 0, percentage: 0 });

      // If upload fails, store locally as fallback
      const localUrl = `data:image/${photo.format};base64,${photo.base64String}`;
      return {
        url: localUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: true,
        base64Data: photo.base64String
      };
    }
  }

  async uploadSignature(signatureDataUrl: string, workOrderId: string): Promise<PhotoData> {
    const base64Data = signatureDataUrl.split(',')[1];
    const timestamp = Date.now();
    const fileName = `${workOrderId}/signature_${timestamp}.png`;

    // If offline, store locally
    if (!this.networkService.currentStatus) {
      return {
        url: signatureDataUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: true,
        base64Data: base64Data
      };
    }

    // If online, upload to Supabase
    try {
      const blob = this.base64ToBlob(base64Data, 'image/png');

      const { data, error } = await this.supabase.uploadFile(
        'work-order-photos',
        fileName,
        blob
      );

      if (error) {
        throw error;
      }

      const { data: urlData } = this.supabase.getPublicUrl('work-order-photos', fileName);

      return {
        url: urlData.publicUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: false
      };
    } catch (error) {
      // If upload fails, store locally as fallback
      return {
        url: signatureDataUrl,
        path: fileName,
        timestamp: new Date(),
        isLocal: true,
        base64Data: base64Data
      };
    }
  }

  async deletePhoto(path: string): Promise<void> {
    // Only try to delete from server if online
    if (this.networkService.currentStatus) {
      const { error } = await this.supabase.deleteFile('work-order-photos', path);
      if (error) {
        throw error;
      }
    }
    // If offline, deletion will be handled when syncing
  }

  // Upload local photos to server (called during sync)
  async uploadLocalPhoto(photoData: PhotoData): Promise<PhotoData> {
    if (!photoData.base64Data || !photoData.isLocal) {
      return photoData;
    }

    const mimeType = photoData.path.includes('signature') ? 'image/png' : 'image/jpeg';
    const blob = this.base64ToBlob(photoData.base64Data, mimeType);

    const { data, error } = await this.supabase.uploadFile(
      'work-order-photos',
      photoData.path,
      blob
    );

    if (error) {
      throw error;
    }

    const { data: urlData } = this.supabase.getPublicUrl('work-order-photos', photoData.path);

    return {
      url: urlData.publicUrl,
      path: photoData.path,
      timestamp: photoData.timestamp,
      isLocal: false
    };
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}
