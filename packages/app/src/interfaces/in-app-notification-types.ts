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
