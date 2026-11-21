export interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  at: string;
}

/**
 * Preferensi platform yang dipakai UI. Backend belum memiliki endpoint
 * `/admin/settings`, sehingga nilai awalnya adalah zero-value bertipe.
 */
export interface PlatformSettings {
  serviceFee: number;
  maxTicketsPerOrder: number;
  autoApproveOrganizer: boolean;
  eventModeration: boolean;
  payoutSchedule: string;
  supportEmail: string;
  supportPhone: string;
}

export const defaultPlatformSettings: PlatformSettings = {
  serviceFee: 0,
  maxTicketsPerOrder: 0,
  autoApproveOrganizer: false,
  eventModeration: false,
  payoutSchedule: "",
  supportEmail: "",
  supportPhone: "",
};
