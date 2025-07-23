import { GrowiDeploymentType, GrowiServiceType } from '@growi/core/dist/consts';
import type { IGrowiInfo } from '@growi/core/dist/interfaces';
import { GrowiWikiType } from '@growi/core/dist/interfaces';
import { Schema } from 'mongoose';

import type { IGrowiAppAdditionalInfo } from '~/features/questionnaire/interfaces/growi-app-info';
import { AttachmentMethodType } from '~/interfaces/attachment';
import { IExternalAuthProviderType } from '~/interfaces/external-auth-provider';

const growiAdditionalInfoSchema = new Schema<IGrowiAppAdditionalInfo>({
  installedAt: { type: Date, required: true },
  installedAtByOldestUser: { type: Date, required: true },
  currentUsersCount: { type: Number, required: true },
  currentActiveUsersCount: { type: Number, required: true },
  attachmentType: { type: String, required: true, enum: Object.values(AttachmentMethodType) },
  activeExternalAccountTypes: [{ type: String, enum: Object.values(IExternalAuthProviderType) }],
  currentPagesCount: { type: Number, required: true },
});

export const growiInfoSchema = new Schema<IGrowiInfo<IGrowiAppAdditionalInfo> & IGrowiAppAdditionalInfo>({
  version: { type: String, required: true },
  appSiteUrl: { type: String },
  serviceInstanceId: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(GrowiServiceType) },
  wikiType: { type: String, required: true, enum: Object.values(GrowiWikiType) },
  osInfo: {
    type: { type: String },
    platform: String,
    arch: String,
    totalmem: Number,
  },
  deploymentType: { type: String, enum: (<(string | null)[]>Object.values(GrowiDeploymentType)).concat([null]) },
  additionalInfo: growiAdditionalInfoSchema,

  // legacy properties (extracted from additionalInfo for growi-questionnaire)
  // see: https://gitlab.weseek.co.jp/tech/growi/growi-questionnaire
  installedAt: { type: Date },
  installedAtByOldestUser: { type: Date },
  currentUsersCount: { type: Number },
  currentActiveUsersCount: { type: Number },
  attachmentType: { type: String, enum: Object.values(AttachmentMethodType) },
  activeExternalAccountTypes: [{ type: String, enum: Object.values(IExternalAuthProviderType) }],
  currentPagesCount: { type: Number },
});
