import { Schema } from 'mongoose';

import {
  GrowiAttachmentType, GrowiDeploymentType, GrowiExternalAuthProviderType, GrowiServiceType, GrowiWikiType, IGrowiInfo,
} from '../../../interfaces/growi-info';

export const growiInfoSchema = new Schema<IGrowiInfo>({
  version: { type: String, required: true },
  appSiteUrl: { type: String },
  appSiteUrlHashed: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(GrowiServiceType) },
  currentUsersCount: { type: Number, required: true },
  currentActiveUsersCount: { type: Number, required: true },
  wikiType: { type: String, required: true, enum: Object.values(GrowiWikiType) },
  attachmentType: { type: String, required: true, enum: Object.values(GrowiAttachmentType) },
  activeExternalAccountTypes: [{ type: String, enum: Object.values(GrowiExternalAuthProviderType) }],
  osInfo: {
    type: { type: String },
    platform: String,
    arch: String,
    totalmem: Number,
  },
  deploymentType: { type: String, enum: (<(string | null)[]>Object.values(GrowiDeploymentType)).concat([null]) },
});
