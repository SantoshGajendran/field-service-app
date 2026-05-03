export interface ChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface Checklist {
  id?: string;
  workOrderId: string;
  items: ChecklistItem[];
}
