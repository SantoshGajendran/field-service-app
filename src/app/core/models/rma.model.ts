export interface RmaRequest {
  id: string;
  partId: string;
  serialNumber?: string;
  quantity: number;
  reason: 'DEFECTIVE' | 'DAMAGED' | 'WRONG_PART' | 'EXPIRED' | 'OTHER';
  description: string;
  photoUrls: string[];
  requestedBy: string;
  requestDate: string;
  rmaNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'COMPLETED';
  supplierResponse?: string;
  resolutionType?: 'REPLACEMENT' | 'REFUND' | 'CREDIT';
  resolutionDate?: string;
  trackingNumber?: string;
}

export interface RmaResolution {
  resolutionType: 'REPLACEMENT' | 'REFUND' | 'CREDIT';
  rmaNumber: string;
  supplierResponse: string;
  trackingNumber?: string;
  amount?: number;
}
