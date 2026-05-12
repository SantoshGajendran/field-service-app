export interface PartUsage {
  id: string;
  workOrderId: string;
  partId: string;
  technicianId: string;
  checkoutSessionId: string;
  quantity: number;
  serialNumber?: string;
  reason: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  customerApproved: boolean;
  customerSignatureUrl?: string;
  installationDate: string;
  warrantyExpirationDate?: string;
  replacementRecommendation?: string;
  notes?: string;
  timestamp: string;
}

export interface SerializedPart {
  id: string;
  partId: string;
  serialNumber: string;
  status: 'IN_STOCK' | 'CHECKED_OUT' | 'INSTALLED' | 'RETURNED' | 'DEFECTIVE' | 'DISPOSED';
  currentLocationId: string;
  installationDate?: string;
  installedOnEquipmentId?: string;
  installedAtWorkOrderId?: string;
  warrantyExpirationDate?: string;
  serviceHistory: ServiceHistoryEntry[];
  purchaseDate?: string;
  purchaseCost?: number;
  supplierBatchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceHistoryEntry {
  date: string;
  workOrderId: string;
  action: 'INSTALLED' | 'SERVICED' | 'REPLACED' | 'INSPECTED';
  notes: string;
  technicianId: string;
}

export interface SerializedPartInstallation {
  partId: string;
  serialNumber: string;
  workOrderId: string;
  equipmentId: string;
  installationDate: Date;
  warrantyMonths: number;
  notes?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
