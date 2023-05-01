import { Schema } from 'mongoose';

import { IUserInfo, UserType } from '../../../interfaces/user-info';

export const userInfoSchema = new Schema<IUserInfo>({
  userIdHash: { type: String },
  type: { type: String, required: true, enum: Object.values(UserType) },
  userCreatedAt: { type: Date },
});
