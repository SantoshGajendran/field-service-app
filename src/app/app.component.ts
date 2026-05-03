import { Component, inject, OnInit } from '@angular/core';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';
import { WorkOrderListComponent } from './features/work-orders/containers/work-order-list/work-order-list.component';
import { DatabaseInitService } from './shared/services/database-init.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppLayoutComponent, WorkOrderListComponent],
  template: `
    <app-layout>
      <app-work-order-list></app-work-order-list>
    </app-layout>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private dbInitService = inject(DatabaseInitService);

  async ngOnInit() {
    await this.dbInitService.seedInitialData();
  }
}
