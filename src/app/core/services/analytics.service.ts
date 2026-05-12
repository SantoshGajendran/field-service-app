import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest } from 'rxjs';
import { InventoryRepository } from '../repositories/inventory.repository';
import { UsageRepository } from '../repositories/usage.repository';
import { CheckoutRepository } from '../repositories/checkout.repository';
import {
  InventoryValuation,
  UsageReport,
  PartUsageStats,
  ConsumptionTrend,
  ProfitMargin,
  SupplierSpend,
  ForecastData,
  ROIAnalysis
} from '../models/analytics.model';
import { DateRange } from '../models/usage.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private inventoryRepo = inject(InventoryRepository);
  private usageRepo = inject(UsageRepository);
  private checkoutRepo = inject(CheckoutRepository);

  getInventoryValuation(): Observable<InventoryValuation> {
    return combineLatest([
      this.inventoryRepo.parts$,
      this.inventoryRepo.stockLevels$,
      this.inventoryRepo.locations$
    ]).pipe(
      map(([parts, stockLevels, locations]) => {
        let totalValue = 0;
        const byLocation: { locationId: string; locationName: string; value: number }[] = [];
        const byCategory: Map<string, number> = new Map();

        // Calculate total value and by location
        stockLevels.forEach(stock => {
          const part = parts.find(p => p.id === stock.partId);
          if (part) {
            const value = part.unitCost * stock.quantity;
            totalValue += value;

            // By location
            const locationIndex = byLocation.findIndex(l => l.locationId === stock.locationId);
            if (locationIndex > -1) {
              byLocation[locationIndex].value += value;
            } else {
              const location = locations.find(l => l.id === stock.locationId);
              byLocation.push({
                locationId: stock.locationId,
                locationName: location?.name || 'Unknown',
                value
              });
            }

            // By category
            const categoryValue = byCategory.get(part.category) || 0;
            byCategory.set(part.category, categoryValue + value);
          }
        });

        return {
          totalValue,
          byLocation,
          byCategory: Array.from(byCategory.entries()).map(([category, value]) => ({
            category,
            value
          }))
        };
      })
    );
  }

  getUsageReport(dateRange?: DateRange): Observable<UsageReport> {
    return combineLatest([
      this.usageRepo.partUsage$,
      this.inventoryRepo.parts$
    ]).pipe(
      map(([usage, parts]) => {
        // Filter by date range if provided
        let filteredUsage = usage;
        if (dateRange) {
          filteredUsage = usage.filter(u => {
            const usageDate = new Date(u.timestamp);
            return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
          });
        }

        const totalPartsUsed = filteredUsage.reduce((sum, u) => sum + u.quantity, 0);

        // Calculate total cost
        const totalCost = filteredUsage.reduce((sum, u) => {
          const part = parts.find(p => p.id === u.partId);
          return sum + (part ? part.unitCost * u.quantity : 0);
        }, 0);

        // By part
        const partMap = new Map<string, { quantity: number; cost: number }>();
        filteredUsage.forEach(u => {
          const part = parts.find(p => p.id === u.partId);
          if (part) {
            const existing = partMap.get(u.partId) || { quantity: 0, cost: 0 };
            partMap.set(u.partId, {
              quantity: existing.quantity + u.quantity,
              cost: existing.cost + (part.unitCost * u.quantity)
            });
          }
        });

        const byPart = Array.from(partMap.entries()).map(([partId, data]) => {
          const part = parts.find(p => p.id === partId);
          return {
            partId,
            partName: part?.name || 'Unknown',
            quantity: data.quantity,
            cost: data.cost
          };
        });

        // By technician
        const techMap = new Map<string, { partsUsed: number; cost: number }>();
        filteredUsage.forEach(u => {
          const part = parts.find(p => p.id === u.partId);
          const existing = techMap.get(u.technicianId) || { partsUsed: 0, cost: 0 };
          techMap.set(u.technicianId, {
            partsUsed: existing.partsUsed + u.quantity,
            cost: existing.cost + (part ? part.unitCost * u.quantity : 0)
          });
        });

        const byTechnician = Array.from(techMap.entries()).map(([technicianId, data]) => ({
          technicianId,
          technicianName: `Technician ${technicianId}`, // Would need to fetch from user service
          partsUsed: data.partsUsed,
          cost: data.cost
        }));

        return {
          totalPartsUsed,
          totalCost,
          byPart,
          byTechnician
        };
      })
    );
  }

  getTopUsedParts(limit: number = 10, dateRange?: DateRange): Observable<PartUsageStats[]> {
    return combineLatest([
      this.usageRepo.partUsage$,
      this.inventoryRepo.parts$
    ]).pipe(
      map(([usage, parts]) => {
        // Filter by date range if provided
        let filteredUsage = usage;
        if (dateRange) {
          filteredUsage = usage.filter(u => {
            const usageDate = new Date(u.timestamp);
            return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
          });
        }

        // Aggregate by part
        const partStats = new Map<string, { quantity: number; frequency: number; cost: number }>();
        filteredUsage.forEach(u => {
          const part = parts.find(p => p.id === u.partId);
          if (part) {
            const existing = partStats.get(u.partId) || { quantity: 0, frequency: 0, cost: 0 };
            partStats.set(u.partId, {
              quantity: existing.quantity + u.quantity,
              frequency: existing.frequency + 1,
              cost: existing.cost + (part.unitCost * u.quantity)
            });
          }
        });

        // Convert to array and sort by quantity
        const stats: PartUsageStats[] = Array.from(partStats.entries())
          .map(([partId, data]) => {
            const part = parts.find(p => p.id === partId);
            return {
              partId,
              partName: part?.name || 'Unknown',
              partNumber: part?.partNumber || 'Unknown',
              quantityUsed: data.quantity,
              frequency: data.frequency,
              totalCost: data.cost
            };
          })
          .sort((a, b) => b.quantityUsed - a.quantityUsed)
          .slice(0, limit);

        return stats;
      })
    );
  }

  getConsumptionTrends(months: number = 12): Observable<ConsumptionTrend[]> {
    return combineLatest([
      this.usageRepo.partUsage$,
      this.inventoryRepo.parts$
    ]).pipe(
      map(([usage, parts]) => {
        const now = new Date();
        const trends: ConsumptionTrend[] = [];

        for (let i = months - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

          const monthUsage = usage.filter(u => {
            const usageDate = new Date(u.timestamp);
            return usageDate >= monthDate && usageDate <= monthEnd;
          });

          const quantity = monthUsage.reduce((sum, u) => sum + u.quantity, 0);
          const cost = monthUsage.reduce((sum, u) => {
            const part = parts.find(p => p.id === u.partId);
            return sum + (part ? part.unitCost * u.quantity : 0);
          }, 0);

          trends.push({
            month: monthDate.toISOString().substring(0, 7), // YYYY-MM format
            quantity,
            cost
          });
        }

        return trends;
      })
    );
  }

  getProfitMargin(dateRange?: DateRange): Observable<ProfitMargin> {
    return combineLatest([
      this.usageRepo.partUsage$,
      this.inventoryRepo.parts$
    ]).pipe(
      map(([usage, parts]) => {
        // Filter by date range if provided
        let filteredUsage = usage;
        if (dateRange) {
          filteredUsage = usage.filter(u => {
            const usageDate = new Date(u.timestamp);
            return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
          });
        }

        const cost = filteredUsage.reduce((sum, u) => {
          const part = parts.find(p => p.id === u.partId);
          return sum + (part ? part.unitCost * u.quantity : 0);
        }, 0);

        const revenue = filteredUsage.reduce((sum, u) => {
          const part = parts.find(p => p.id === u.partId);
          return sum + (part ? part.unitPrice * u.quantity : 0);
        }, 0);

        const profit = revenue - cost;
        const marginPercentage = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          revenue,
          cost,
          profit,
          marginPercentage
        };
      })
    );
  }

  getSupplierSpend(): Observable<SupplierSpend[]> {
    return combineLatest([
      this.inventoryRepo.parts$,
      this.inventoryRepo.stockLevels$
    ]).pipe(
      map(([parts, stockLevels]) => {
        const supplierMap = new Map<string, { totalSpend: number; partCount: number }>();

        parts.forEach(part => {
          const partStock = stockLevels.filter(s => s.partId === part.id);
          const totalQuantity = partStock.reduce((sum, s) => sum + s.quantity, 0);
          const spend = part.unitCost * totalQuantity;

          const existing = supplierMap.get(part.supplier) || { totalSpend: 0, partCount: 0 };
          supplierMap.set(part.supplier, {
            totalSpend: existing.totalSpend + spend,
            partCount: existing.partCount + 1
          });
        });

        return Array.from(supplierMap.entries()).map(([supplier, data]) => ({
          supplier,
          totalSpend: data.totalSpend,
          partCount: data.partCount,
          averageCost: data.totalSpend / data.partCount
        }));
      })
    );
  }

  getForecast(partId: string, monthsAhead: number = 6): Observable<ForecastData> {
    return combineLatest([
      this.usageRepo.partUsage$,
      this.inventoryRepo.parts$,
      this.inventoryRepo.stockLevels$
    ]).pipe(
      map(([usage, parts, stockLevels]) => {
        const part = parts.find(p => p.id === partId);
        if (!part) {
          throw new Error('Part not found');
        }

        // Get historical usage (last 12 months)
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        const historicalUsage = usage.filter(u => {
          const usageDate = new Date(u.timestamp);
          return u.partId === partId && usageDate >= twelveMonthsAgo;
        });

        // Calculate average monthly usage
        const totalUsed = historicalUsage.reduce((sum, u) => sum + u.quantity, 0);
        const avgMonthlyUsage = totalUsed / 12;

        // Simple linear forecast (could be enhanced with ML)
        const predictions = [];
        for (let i = 1; i <= monthsAhead; i++) {
          const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
          predictions.push({
            month: forecastDate.toISOString().substring(0, 7),
            predictedQuantity: Math.round(avgMonthlyUsage)
          });
        }

        // Calculate confidence based on data consistency
        const confidence = historicalUsage.length > 0 ? Math.min(historicalUsage.length / 12, 1) : 0;

        // Calculate recommended reorder date
        const currentStock = stockLevels
          .filter(s => s.partId === partId)
          .reduce((sum, s) => sum + s.availableQuantity, 0);

        const daysUntilReorder = Math.floor((currentStock - part.minStockLevel) / (avgMonthlyUsage / 30));
        const reorderDate = new Date();
        reorderDate.setDate(reorderDate.getDate() + Math.max(0, daysUntilReorder));

        return {
          partId,
          partName: part.name,
          predictions,
          confidence,
          recommendedReorderDate: reorderDate.toISOString()
        };
      })
    );
  }

  getROIAnalysis(dateRange?: DateRange): Observable<ROIAnalysis> {
    return this.getProfitMargin(dateRange).pipe(
      map(margin => {
        const totalInvestment = margin.cost;
        const totalRevenue = margin.revenue;
        const roi = totalRevenue - totalInvestment;
        const roiPercentage = totalInvestment > 0 ? (roi / totalInvestment) * 100 : 0;

        return {
          totalInvestment,
          totalRevenue,
          roi,
          roiPercentage
        };
      })
    );
  }
}
