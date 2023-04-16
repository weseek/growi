import type { Ref, IUser } from '@growi/core';
import {
  Schema, Model, Document,
} from 'mongoose';


import { SidebarContentsType } from '~/interfaces/ui';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';

import { getOrCreateModel } from '../util/mongoose-utils';


export interface UserUISettingsDocument extends IUserUISettings, Document {
  user: Ref<IUser>,
}
export type UserUISettingsModel = Model<UserUISettingsDocument>

const schema = new Schema<UserUISettingsDocument, UserUISettingsModel>({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  isSidebarCollapsed: { type: Boolean, default: false },
  currentSidebarContents: {
    type: String,
    enum: SidebarContentsType,
    default: SidebarContentsType.RECENT,
  },
  currentProductNavWidth: { type: Number },
  preferDrawerModeByUser: { type: Boolean, default: false },
  preferDrawerModeOnEditByUser: { type: Boolean, default: true },
});


export default getOrCreateModel<UserUISettingsDocument, UserUISettingsModel>('UserUISettings', schema);
