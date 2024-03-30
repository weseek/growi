export const AnnouncementStatuses = {
  STATUS_UNREAD: 'UNREAD',
  STATUS_ALREADY_READ: 'ALREADY_READ',
  STATUS_IGNORED: 'IGNORED',
} as const;

type AnnouncementStatuses = typeof AnnouncementStatuses[keyof typeof AnnouncementStatuses];
