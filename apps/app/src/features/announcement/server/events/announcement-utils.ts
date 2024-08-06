export const AnnouncementStatuses = {
  STATUS_UNREAD: 'UNREAD',
  STATUS_ALREADY_READ: 'ALREADY_READ',
  STATUS_IGNORED: 'IGNORED',
} as const;

export type AnnouncementStatusesType = typeof AnnouncementStatuses[keyof typeof AnnouncementStatuses];
