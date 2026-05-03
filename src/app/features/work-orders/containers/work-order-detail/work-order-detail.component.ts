import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkOrderRepository } from '../../../../core/repositories/work-order.repository';
import { ChecklistRepository } from '../../../../core/repositories/checklist.repository';
import { SyncService } from '../../../../core/services/sync.service';
import { PhotoService } from '../../../../core/services/photo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LocationService } from '../../../../core/services/location.service';
import { WorkOrder } from '../../../../core/models/work-order.model';
import { Checklist, ChecklistItem } from '../../../../core/models/checklist.model';
import { ChecklistComponent } from '../../components/checklist/checklist.component';
import { SignaturePadComponent } from '../../../../shared/components/signature-pad/signature-pad.component';
import { LocationHistoryComponent } from '../../../../shared/components/location-history/location-history.component';
import { MapViewComponent, MapLocation } from '../../../../shared/components/map-view/map-view.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-work-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChecklistComponent, SignaturePadComponent, LocationHistoryComponent, MapViewComponent],
  template: `
    <div class="detail-container glass-panel">
      <div class="header">
        <button class="back-btn" (click)="goBack()" aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2>Work Order Details</h2>
      </div>

      <div *ngIf="workOrder" class="content">
        <div class="status-header">
          <div class="meta-data">
            <span class="id">#{{ workOrder.id }}</span>
            <span class="date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ workOrder.createdAt | date:'medium' }}
            </span>
          </div>
          <div class="status-indicator">
            <span class="pulse-dot"></span>
            {{ workOrder.status.replace('_', ' ') }}
          </div>
        </div>

        <h3 class="title">{{ workOrder.title }}</h3>

        <div class="info-grid glass-panel-light">
          <div class="info-item">
            <span class="label">Equipment</span>
            <span class="value">{{ workOrder.equipment_id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Last Updated</span>
            <span class="value">{{ workOrder.updatedAt | date:'short' }}</span>
          </div>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="edit-form">
          <div class="form-group">
            <label for="status">Status</label>
            <select id="status" formControlName="status" class="glass-input">
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              rows="5"
              class="glass-input"
              placeholder="Enter work order description..."></textarea>
          </div>

          <app-checklist
            [items]="checklist?.items || []"
            (toggleItem)="onChecklistToggle($event)">
          </app-checklist>

          <!-- Location/Check-in Section -->
          <div class="location-section">
            <div class="section-header">
              <h4>Location & Time Tracking</h4>
            </div>

            <div class="check-in-actions" *ngIf="!isCheckedIn() && !workOrder?.check_out">
              <button type="button" class="check-in-btn" (click)="checkIn()" [disabled]="isCheckingIn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ isCheckingIn ? 'Checking In...' : 'Check In' }}
              </button>
            </div>

            <div class="check-in-info" *ngIf="workOrder && workOrder.check_in">
              <div class="location-card">
                <div class="location-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span class="location-label">Check-In Location</span>
                </div>
                <div class="location-details">
                  <div class="location-coords">
                    <span>{{ workOrder.check_in.location.latitude.toFixed(6) }}, {{ workOrder.check_in.location.longitude.toFixed(6) }}</span>
                    <span class="accuracy">±{{ workOrder.check_in.location.accuracy.toFixed(0) }}m</span>
                  </div>
                  <div class="location-time">
                    {{ workOrder.check_in.timestamp | date:'short' }}
                  </div>
                  <a [href]="getMapUrl(workOrder.check_in.location.latitude, workOrder.check_in.location.longitude)"
                     target="_blank"
                     class="map-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                    View on Map
                  </a>
                </div>
              </div>

              <button type="button"
                      class="check-out-btn"
                      (click)="checkOut()"
                      [disabled]="isCheckingOut || !!workOrder.check_out"
                      *ngIf="!workOrder.check_out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                {{ isCheckingOut ? 'Checking Out...' : 'Check Out' }}
              </button>
            </div>

            <div class="check-out-info" *ngIf="workOrder && workOrder.check_out">
              <div class="location-card">
                <div class="location-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span class="location-label">Check-Out Location</span>
                </div>
                <div class="location-details">
                  <div class="location-coords">
                    <span>{{ workOrder.check_out.location.latitude.toFixed(6) }}, {{ workOrder.check_out.location.longitude.toFixed(6) }}</span>
                    <span class="accuracy">±{{ workOrder.check_out.location.accuracy.toFixed(0) }}m</span>
                  </div>
                  <div class="location-time">
                    {{ workOrder.check_out.timestamp | date:'short' }}
                  </div>
                  <a [href]="getMapUrl(workOrder.check_out.location.latitude, workOrder.check_out.location.longitude)"
                     target="_blank"
                     class="map-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                    View on Map
                  </a>
                </div>
              </div>

              <div class="work-summary">
                <div class="summary-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div class="summary-content">
                    <span class="summary-label">Duration</span>
                    <span class="summary-value">{{ formatDuration(workOrder.check_out.duration || 0) }}</span>
                  </div>
                </div>
                <div class="summary-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                  <div class="summary-content">
                    <span class="summary-label">Distance Traveled</span>
                    <span class="summary-value">{{ formatDistance(workOrder.check_out.distance || 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Map View -->
          <div class="map-section" *ngIf="workOrder && getMapLocations().length > 0">
            <app-map-view
              [locations]="getMapLocations()"
              [title]="'Work Order Locations'"
              [showHeader]="true"
              [showLegend]="true">
            </app-map-view>
          </div>

          <!-- Location History -->
          <div class="location-history-section" *ngIf="workOrder">
            <app-location-history [workOrderId]="workOrder.id"></app-location-history>
          </div>

          <!-- Photo Gallery Section -->
          <div class="photos-section">
            <div class="section-header">
              <h4>Photos</h4>
              <div class="photo-actions">
                <button type="button" class="photo-btn" (click)="takePhoto()" [disabled]="isUploadingPhoto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  {{ isUploadingPhoto ? 'Uploading...' : 'Take Photo' }}
                </button>
                <button type="button" class="photo-btn secondary" (click)="pickFromGallery()" [disabled]="isUploadingPhoto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Gallery
                </button>
              </div>
            </div>

            <div class="photo-grid" *ngIf="workOrder && workOrder.photos && workOrder.photos.length > 0">
              <div class="photo-item" *ngFor="let photo of workOrder.photos; let i = index">
                <img [src]="photo.url" [alt]="'Photo ' + (i + 1)">
                <button type="button" class="delete-photo-btn" (click)="deletePhoto(i)" title="Delete photo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <p class="no-photos" *ngIf="!workOrder || !workOrder.photos || workOrder.photos.length === 0">
              No photos added yet
            </p>
          </div>

          <!-- Signature Section -->
          <div class="signature-section" *ngIf="workOrder && workOrder.status === 'COMPLETED'">
            <div class="section-header">
              <h4>Customer Signature</h4>
              <button type="button" class="signature-btn" (click)="showSignaturePad = true" *ngIf="workOrder && !workOrder.signature_url">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
                Add Signature
              </button>
            </div>

            <div class="signature-display" *ngIf="workOrder && workOrder.signature_url">
              <img [src]="workOrder.signature_url" alt="Customer Signature">
              <button type="button" class="clear-signature-btn" (click)="clearSignature()">
                Clear Signature
              </button>
            </div>

            <app-signature-pad
              *ngIf="showSignaturePad"
              (signatureSaved)="onSignatureSaved($event)"
              (cancelled)="showSignaturePad = false">
            </app-signature-pad>
          </div>

          <button type="submit" class="submit-btn" [disabled]="editForm.invalid || !editForm.dirty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Changes
          </button>
        </form>
      </div>

      <div *ngIf="!workOrder" class="loading">
        <div class="spinner"></div>
        Loading work order...
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 1.5rem;
      margin: 1rem;
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.5s ease-out;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-text-primary);
        font-weight: 600;
      }
    }

    .back-btn {
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-primary);
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-lighter);
        border-color: var(--color-accent-primary);
        color: var(--color-accent-primary);
        transform: translateX(-4px);
        box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .meta-data {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .id {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      font-family: var(--font-mono);
      letter-spacing: 1px;
    }

    .date {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      display: flex;
      align-items: center;
      gap: 4px;

      svg {
        width: 14px;
        height: 14px;
      }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      text-transform: uppercase;
      letter-spacing: 1px;

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: var(--color-accent-primary);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
        box-shadow: 0 0 10px var(--color-accent-primary);
      }
    }

    .title {
      margin: 0;
      font-size: 1.5rem;
      color: var(--color-text-primary);
      font-weight: 600;
      line-height: 1.4;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      padding: 16px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .label {
        font-size: 0.75rem;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
      }

      .value {
        font-size: 0.95rem;
        color: var(--color-text-primary);
        font-weight: 500;
      }
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .glass-input {
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      padding: 0.875rem 1rem;
      color: var(--color-text-primary);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      transition: all var(--transition-base);

      &:focus {
        background: var(--glass-bg-lighter);
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2), 0 0 20px rgba(14, 165, 233, 0.1);
      }

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    select.glass-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.2em;
      padding-right: 3rem;
      cursor: pointer;

      &:hover {
        border-color: var(--glass-border-light);
      }
    }

    textarea.glass-input {
      resize: vertical;
      min-height: 120px;
      line-height: 1.6;
    }

    .submit-btn {
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(14, 165, 233, 0.6);
      }

      &:active:not([disabled]) {
        transform: translateY(0);
      }

      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--glass-bg);
        color: var(--color-text-tertiary);
        box-shadow: none;
      }
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: var(--color-text-secondary);
      font-size: 1.1rem;

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--glass-border);
        border-top-color: var(--color-accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 12px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .photos-section,
    .signature-section,
    .location-section,
    .location-history-section,
    .map-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 1rem;
        color: var(--color-text-primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .photo-actions {
      display: flex;
      gap: 8px;
    }

    .photo-btn,
    .signature-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      &.secondary {
        background: var(--glass-bg);
        color: var(--color-text-primary);
        border: 1px solid var(--glass-border);
        box-shadow: none;

        &:hover:not(:disabled) {
          background: var(--glass-bg-lighter);
          border-color: var(--color-accent-primary);
        }
      }
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .delete-photo-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 28px;
        height: 28px;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all var(--transition-base);

        svg {
          width: 16px;
          height: 16px;
        }
      }

      &:hover .delete-photo-btn {
        opacity: 1;
      }
    }

    .no-photos {
      text-align: center;
      color: var(--color-text-tertiary);
      font-size: 0.9rem;
      padding: 2rem;
      margin: 0;
    }

    .signature-display {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-sm);
      }

      .clear-signature-btn {
        align-self: flex-start;
        padding: 8px 16px;
        background: transparent;
        border: 1px solid var(--color-status-error);
        border-radius: var(--radius-md);
        color: var(--color-status-error);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-base);

        &:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      }
    }

    .check-in-actions {
      display: flex;
      justify-content: center;
    }

    .check-in-btn,
    .check-out-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
      width: 100%;
      max-width: 300px;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(14, 165, 233, 0.6);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .check-out-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);

      &:hover:not(:disabled) {
        box-shadow: 0 6px 24px rgba(16, 185, 129, 0.6);
      }
    }

    .check-in-info,
    .check-out-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .location-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .location-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-accent-primary);
      font-weight: 600;
      font-size: 0.9rem;

      svg {
        width: 20px;
        height: 20px;
      }

      .location-label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .location-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-left: 28px;
    }

    .location-coords {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--color-text-primary);

      .accuracy {
        padding: 2px 8px;
        background: rgba(14, 165, 233, 0.15);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        color: var(--color-accent-primary);
      }
    }

    .location-time {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--color-accent-primary);
      border-radius: var(--radius-md);
      color: var(--color-accent-primary);
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-base);
      align-self: flex-start;
      margin-top: 4px;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(14, 165, 233, 0.1);
        transform: translateX(2px);
      }
    }

    .work-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      padding: 16px;
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      svg {
        width: 24px;
        height: 24px;
        color: var(--color-accent-primary);
        flex-shrink: 0;
      }

      .summary-content {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .summary-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-value {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          font-weight: 600;
        }
      }
    }
  `]
})
export class WorkOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private workOrderRepo = inject(WorkOrderRepository);
  private checklistRepo = inject(ChecklistRepository);
  private syncService = inject(SyncService);
  private photoService = inject(PhotoService);
  private toastService = inject(ToastService);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);

  workOrder: WorkOrder | null = null;
  checklist: Checklist | null = null;
  showSignaturePad = false;
  isUploadingPhoto = false;
  isCheckingIn = false;
  isCheckingOut = false;

  editForm = this.fb.group({
    status: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workOrderRepo.workOrders$.pipe(take(1)).subscribe(orders => {
        const order = orders.find(o => o.id === id);
        if (order) {
          this.workOrder = order;
          this.editForm.patchValue({
            status: order.status,
            description: order.description
          });
        }
      });

      this.checklistRepo.checklists$.subscribe(checklists => {
        const found = checklists.find(c => c.workOrderId === id);
        this.checklist = found || null;
      });
    }
  }

  goBack() {
    this.location.back();
  }

  onChecklistToggle(item: ChecklistItem) {
    if (!this.checklist) return;

    // Create updated checklist immutable copy
    const updatedItems = this.checklist.items.map(i => 
      i.id === item.id ? { ...i, isCompleted: !i.isCompleted } : i
    );
    const updatedChecklist: Checklist = {
      ...this.checklist,
      items: updatedItems
    };

      // Update local source of truth
    this.checklistRepo.updateChecklist(updatedChecklist).then(() => {
      // Queue outbox sync
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'CHECKLIST',
        entityId: updatedChecklist.workOrderId,
        action: 'UPDATE',
        payload: updatedChecklist,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });
    });
  }

  onSubmit() {
    if (this.editForm.valid && this.workOrder) {
      const updatedValues = this.editForm.value;
      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        status: updatedValues.status as WorkOrder['status'],
        description: updatedValues.description as string,
        updatedAt: new Date().toISOString()
      };

      // 1. Update Single Source of Truth instantly (optimistic UI update)
      this.workOrderRepo.update(updatedWorkOrder).then(() => {

        // 2. Queue the Outbox Sync task
        this.syncService.addToSyncQueue({
          id: crypto.randomUUID(),
          entityType: 'WORK_ORDER',
          entityId: updatedWorkOrder.id,
          action: 'UPDATE',
          payload: updatedWorkOrder,
          createdAt: new Date().toISOString(),
          status: 'PENDING',
          retryCount: 0
        });

        this.editForm.markAsPristine();
      });
    }
  }

  async takePhoto() {
    if (!this.workOrder) return;

    try {
      this.isUploadingPhoto = true;
      const photo = await this.photoService.takePhoto();
      const photoData = await this.photoService.uploadPhoto(photo, this.workOrder.id);

      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        photos: [...(this.workOrder.photos || []), photoData],
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error taking photo:', error);
      this.toastService.error('Failed to take photo. Please try again.');
    } finally {
      this.isUploadingPhoto = false;
    }
  }

  async pickFromGallery() {
    if (!this.workOrder) return;

    try {
      this.isUploadingPhoto = true;
      const photo = await this.photoService.pickFromGallery();
      const photoData = await this.photoService.uploadPhoto(photo, this.workOrder.id);

      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        photos: [...(this.workOrder.photos || []), photoData],
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error picking photo:', error);
      this.toastService.error('Failed to pick photo. Please try again.');
    } finally {
      this.isUploadingPhoto = false;
    }
  }

  async deletePhoto(index: number) {
    if (!this.workOrder || !this.workOrder.photos) return;

    const photo = this.workOrder.photos[index];

    try {
      await this.photoService.deletePhoto(photo.path);

      const updatedPhotos = this.workOrder.photos.filter((_, i) => i !== index);
      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        photos: updatedPhotos,
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      this.toastService.error('Failed to delete photo. Please try again.');
    }
  }

  async onSignatureSaved(signatureDataUrl: string) {
    if (!this.workOrder) return;

    try {
      const signatureData = await this.photoService.uploadSignature(signatureDataUrl, this.workOrder.id);

      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        signature_url: signatureData.url,
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;
      this.showSignaturePad = false;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Signature saved successfully!');
    } catch (error) {
      console.error('Error saving signature:', error);
      this.toastService.error('Failed to save signature. Please try again.');
    }
  }

  async clearSignature() {
    if (!this.workOrder || !this.workOrder.signature_url) return;

    const confirmed = confirm('Are you sure you want to clear the signature?');
    if (!confirmed) return;

    try {
      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        signature_url: undefined,
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Signature cleared successfully!');
    } catch (error) {
      console.error('Error clearing signature:', error);
      this.toastService.error('Failed to clear signature. Please try again.');
    }
  }

  async checkIn() {
    if (!this.workOrder) return;

    try {
      this.isCheckingIn = true;

      // Request location permissions
      const hasPermission = await this.locationService.checkPermissions();
      if (!hasPermission) {
        const granted = await this.locationService.requestPermissions();
        if (!granted) {
          this.toastService.error('Location permission required for check-in');
          return;
        }
      }

      // Get current location and check in
      const checkInData = await this.locationService.checkIn(this.workOrder.id);

      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        check_in: checkInData,
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      // Update form status
      this.editForm.patchValue({ status: 'IN_PROGRESS' });

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Checked in successfully!');
    } catch (error) {
      console.error('Error checking in:', error);
      this.toastService.error('Failed to check in. Please try again.');
    } finally {
      this.isCheckingIn = false;
    }
  }

  async checkOut() {
    if (!this.workOrder) return;

    try {
      this.isCheckingOut = true;

      // Get current location and check out
      const checkOutData = await this.locationService.checkOut(this.workOrder.id);

      const updatedWorkOrder: WorkOrder = {
        ...this.workOrder,
        check_out: checkOutData,
        updatedAt: new Date().toISOString()
      };

      await this.workOrderRepo.update(updatedWorkOrder);
      this.workOrder = updatedWorkOrder;

      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'WORK_ORDER',
        entityId: updatedWorkOrder.id,
        action: 'UPDATE',
        payload: updatedWorkOrder,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success(`Checked out! Duration: ${this.locationService.formatDuration(checkOutData.duration || 0)}`);
    } catch (error) {
      console.error('Error checking out:', error);
      this.toastService.error('Failed to check out. Please try again.');
    } finally {
      this.isCheckingOut = false;
    }
  }

  isCheckedIn(): boolean {
    return this.workOrder?.check_in !== undefined && this.workOrder?.check_out === undefined;
  }

  getMapUrl(latitude: number, longitude: number): string {
    return this.locationService.getMapUrl(latitude, longitude);
  }

  formatDistance(meters: number): string {
    return this.locationService.formatDistance(meters);
  }

  formatDuration(minutes: number): string {
    return this.locationService.formatDuration(minutes);
  }

  getMapLocations(): MapLocation[] {
    if (!this.workOrder) return [];

    const locations: MapLocation[] = [];

    // Add check-in location
    if (this.workOrder.check_in) {
      locations.push({
        latitude: this.workOrder.check_in.location.latitude,
        longitude: this.workOrder.check_in.location.longitude,
        label: 'Check In',
        type: 'check-in'
      });
    }

    // Add work order location (if different from check-in)
    if (this.workOrder.work_order_location) {
      locations.push({
        latitude: this.workOrder.work_order_location.latitude,
        longitude: this.workOrder.work_order_location.longitude,
        label: 'Work Site',
        type: 'work-site'
      });
    }

    // Add check-out location
    if (this.workOrder.check_out) {
      locations.push({
        latitude: this.workOrder.check_out.location.latitude,
        longitude: this.workOrder.check_out.location.longitude,
        label: 'Check Out',
        type: 'check-out'
      });
    }

    return locations;
  }
}
