export const UserType = { admin: 'admin', general: 'general' } as const;

export type UserType = typeof UserType[keyof typeof UserType];

export interface IUserInfo {
  userIdHash: string // 生のユーザー ID を appSiteUrl を hash 化したものを salt にして hash 化
  type: UserType
  userCreatedAt: Date // 回答ユーザーの作成日時(登録日時)
}
