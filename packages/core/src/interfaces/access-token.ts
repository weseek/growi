import type { Types } from 'mongoose';

export type IAccessToken = {
  userId: Types.ObjectId,
  tokenHash: string,
  expiredAt: Date,
  scope: string[],
  description: string,
}
