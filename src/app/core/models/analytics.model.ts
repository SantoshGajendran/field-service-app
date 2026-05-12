export interface InventoryValuation {
  totalValue: number;
  byLocation: { locationId: string; locationName: string; value: number }[];
  byCategory: { category: string; value: number }[];
}

export interface UsageReport {
  totalPartsUsed: number;
  totalCost: number;
  byPart: { partId: string; partName: string; quantity: number; cost: number }[];
  byTechnician: { technicianId: string; technicianName: string; partsUsed: number; cost: number }[];
}

export interface PartUsageStats {
  partId: string;
  partName: string;
  partNumber: string;
  quantityUsed: number;
  frequency: number;
  totalCost: number;
}

export interface ConsumptionTrend {
  month: string;
  quantity: number;
  cost: number;
}

export interface ProfitMargin {
  revenue: number;
  cost: number;
  profit: number;
  marginPercentage: number;
}

export interface SupplierSpend {
  supplier: string;
  totalSpend: number;
  partCount: number;
  averageCost: number;
}

export interface ForecastData {
  partId: string;
  partName: string;
  predictions: { month: string; predictedQuantity: number }[];
  confidence: number;
  recommendedReorderDate: string;
}

export interface ROIAnalysis {
  totalInvestment: number;
  totalRevenue: number;
  roi: number;
  roiPercentage: number;
}
