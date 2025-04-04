import { Schema } from 'mongoose';

import type { IUserInfo } from '../../../interfaces/user-info';
import { UserType } from '../../../interfaces/user-info';

export const userInfoSchema = new Schema<IUserInfo>({
  userIdHash: { type: String },
  type: { type: String, required: true, enum: Object.values(UserType) },
  userCreatedAt: { type: Date },
});
