export interface InAppNotification {
  _id: string
  user: string
  targetModel: 'Page'
  // target: Page
  target: any
  action: 'COMMENT' | 'LIKE'
  status: string
  actionUsers: any[]
  createdAt: string
}

export interface Page {
  _id: string
  path: string
  revision: Revision
  redirectTo: string
  status: string
  creator: User
  lastUpdateUser: User
  liker: User[]
  seenUsers: User[]
  commentCount: number
  bookmarkCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Revision {
  _id: string
  path: string
  body: string
  format: string
  author: User
  createdAt: string
}

export interface User {
  _id: string
  image: string
  name: string
  username: string
}

export interface Comment {
  _id: string
  page: string
  creator: string
  revision: string
  comment: string
  commentPosition: number
  createdAt: string
}
