// refer types https://github.com/crowi/crowi/blob/eecf2bc821098d2516b58104fe88fae81497d3ea/client/types/crowi.d.ts
export interface InAppNotification {
  _id: string
  user: string
  targetModel: 'Page'
  target: any /* Need to set "Page" as a type" */
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: any[] /* Need to set "User[]" as a type" */
  createdAt: string
}
