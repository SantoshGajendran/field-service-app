import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MOCK_PARTS, MOCK_LOCATIONS, MOCK_STOCK_LEVELS } from '../data/mock-inventory.data';

@Injectable({
  providedIn: 'root'
})
export class DataSeedService {
  private supabase = inject(SupabaseService);

  async seedInventoryData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting inventory data seed...');

      // 1. Seed Stock Locations
      console.log('Seeding stock locations...');
      const locationsToInsert = MOCK_LOCATIONS.map(loc => ({
        id: loc.id,
        type: loc.type,
        name: loc.name,
        technician_id: loc.technicianId || null,
        address: loc.address || null,
        is_active: loc.isActive
      }));

      const { error: locError } = await this.supabase.client
        .from('stock_locations')
        .upsert(locationsToInsert, { onConflict: 'id' })
        .select();

      if (locError) {
        console.warn('Stock locations seed warning:', locError.message);
      } else {
        console.log(`✓ Seeded ${locationsToInsert.length} stock locations`);
      }

      // 2. Seed Parts
      console.log('Seeding parts...');
      const partsToInsert = MOCK_PARTS.map(part => ({
        id: part.id,
        part_number: part.partNumber,
        name: part.name,
        description: part.description,
        category: part.category,
        subcategory: part.subcategory || null,
        tags: part.tags,
        equipment_compatibility: part.equipmentCompatibility,
        unit_cost: part.unitCost,
        unit_price: part.unitPrice,
        min_stock_level: part.minStockLevel,
        reorder_quantity: part.reorderQuantity,
        supplier: part.supplier,
        supplier_part_number: part.supplierPartNumber || null,
        is_serial_tracked: part.isSerialTracked,
        warranty_months: part.warrantyMonths || null,
        created_at: part.createdAt,
        updated_at: part.updatedAt
      }));

      const { error: partsError } = await this.supabase.client
        .from('parts')
        .upsert(partsToInsert, { onConflict: 'id' })
        .select();

      if (partsError) {
        console.warn('Parts seed warning:', partsError.message);
      } else {
        console.log(`✓ Seeded ${partsToInsert.length} parts`);
      }

      // 3. Seed Stock Levels
      console.log('Seeding stock levels...');
      const stockLevelsToInsert = MOCK_STOCK_LEVELS.map(sl => ({
        id: sl.id,
        part_id: sl.partId,
        location_id: sl.locationId,
        quantity: sl.quantity,
        reserved_quantity: sl.reservedQuantity,
        available_quantity: sl.availableQuantity,
        last_updated: sl.lastUpdated
      }));

      const { error: slError } = await this.supabase.client
        .from('stock_levels')
        .upsert(stockLevelsToInsert, { onConflict: 'id' })
        .select();

      if (slError) {
        console.warn('Stock levels seed warning:', slError.message);
      } else {
        console.log(`✓ Seeded ${stockLevelsToInsert.length} stock levels`);
      }

      console.log('Inventory data seed completed!');
      return { success: true, message: 'Inventory data seeded successfully' };
    } catch (error: any) {
      console.error('Error seeding inventory data:', error);
      return { success: false, message: error.message || 'Failed to seed data' };
    }
  }

  async clearInventoryData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Clearing existing inventory data...');

      await this.supabase.client.from('stock_levels').delete().neq('id', '');
      await this.supabase.client.from('parts').delete().neq('id', '');
      await this.supabase.client.from('stock_locations').delete().neq('id', '');

      console.log('Inventory data cleared');
      return { success: true, message: 'Inventory data cleared' };
    } catch (error: any) {
      console.error('Error clearing inventory data:', error);
      return { success: false, message: error.message || 'Failed to clear data' };
    }
  }
}