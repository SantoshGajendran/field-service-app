import { Injectable, inject } from '@angular/core';
import { WorkOrderRepository } from '../../core/repositories/work-order.repository';
import { WorkOrder } from '../../core/models/work-order.model';
import { ChecklistRepository } from '../../core/repositories/checklist.repository';

@Injectable({
  providedIn: 'root'
})
export class DatabaseInitService {
  private workOrderRepo = inject(WorkOrderRepository);
  private checklistRepo = inject(ChecklistRepository);

  public async seedInitialData(): Promise<void> {
    const existing = await this.workOrderRepo.getAll();
    if (existing && existing.length > 0) {
      return; // Already seeded
    }

    const mockData: WorkOrder[] = [
      {
        id: 'WO-1001',
        title: 'HVAC Maintenance',
        equipment_id: 'HVAC-04',
        status: 'OPEN',
        description: 'Compressor pressure fault. Inspect and replace if necessary.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'WO-1002',
        title: 'Pump Lubrication',
        equipment_id: 'PUMP-12',
        status: 'IN_PROGRESS',
        description: 'Routine maintenance: lubricate bearings and check alignment.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'WO-1003',
        title: 'Generator Testing',
        equipment_id: 'GEN-02',
        status: 'COMPLETED',
        description: 'Emergency shutdown test and filter replacement.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await this.workOrderRepo.saveAll(mockData);

    const mockChecklists = [
      {
        workOrderId: 'WO-1001',
        items: [
          { id: 'c1', label: 'Isolate power', isCompleted: false },
          { id: 'c2', label: 'Check bearing lubrication', isCompleted: false },
          { id: 'c3', label: 'Test operational vibration', isCompleted: false }
        ]
      },
      {
        workOrderId: 'WO-1002',
        items: [
          { id: 'c4', label: 'Visual inspection for leaks', isCompleted: true },
          { id: 'c5', label: 'Test pressure threshold', isCompleted: false }
        ]
      }
    ];

    for (const checklist of mockChecklists) {
      await this.checklistRepo.updateChecklist(checklist);
    }

    console.log('Mock data and checklists seeded into local database');
  }
}
