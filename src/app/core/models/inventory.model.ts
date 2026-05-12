export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  equipmentCompatibility: string[];
  photoUrl?: string;
  thumbnailUrl?: string;
  unitCost: number;
  unitPrice: number;
  minStockLevel: number;
  reorderQuantity: number;
  supplier: string;
  supplierPartNumber?: string;
  isSerialTracked: boolean;
  warrantyMonths?: number;
  specifications?: Record<string, any>;
  alternativeParts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLocation {
  id: string;
  type: 'WAREHOUSE' | 'TECHNICIAN';
  name: string;
  technicianId?: string;
  address?: string;
  isActive: boolean;
}

export interface StockLevel {
  id: string;
  partId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

export interface PartFilters {
  category?: string;
  subcategory?: string;
  tags?: string[];
  equipmentId?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface LowStockAlert {
  part: Part;
  currentStock: number;
  minStockLevel: number;
  locationId: string;
  locationName: string;
  severity: 'WARNING' | 'CRITICAL';
}
