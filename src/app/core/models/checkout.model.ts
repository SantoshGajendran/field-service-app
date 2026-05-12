export interface CheckoutSession {
  id: string;
  technicianId: string;
  fromLocationId: string;
  toLocationId: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items: CheckoutItem[];
  checkoutDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutItem {
  partId: string;
  quantityCheckedOut: number;
  quantityUsed: number;
  quantityReturned: number;
  quantityDamaged: number;
  serialNumbers?: string[];
  status: 'CHECKED_OUT' | 'PARTIALLY_USED' | 'FULLY_USED' | 'RETURNED' | 'PENDING_RETURN';
}

export interface PartReturn {
  partId: string;
  quantityReturned: number;
  quantityDamaged: number;
  condition: 'GOOD' | 'DAMAGED' | 'DEFECTIVE';
  notes?: string;
  photoUrls?: string[];
}
