export interface SyncItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: any;
  createdAt: string;
  status: string;
  retryCount: number;
  lastAttemptAt?: string;
  lastError?: string;
}
