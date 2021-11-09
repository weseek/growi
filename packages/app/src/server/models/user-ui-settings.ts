import {
  Schema, Model, Document,
} from 'mongoose';

import { getOrCreateModel } from '@growi/core';

import { SidebarContentsType } from '~/interfaces/ui';
import { IUserUISettings } from '~/interfaces/user-ui-settings';


export interface UserUISettingsDocument extends IUserUISettings, Document {}
export type UserUISettingsModel = Model<UserUISettingsDocument>

const schema = new Schema<IUserUISettings>({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  isSidebarCollapsed: { type: Boolean, default: false },
  currentSidebarContents: {
    type: String,
    enum: SidebarContentsType,
    default: SidebarContentsType.RECENT,
  },
  currentProductNavWidth: { type: Number },
});


export default getOrCreateModel<UserUISettingsDocument, UserUISettingsModel>('UserUISettings', schema);
