import { getOrCreateModel } from '@growi/core';
import { Schema } from 'mongoose';

import { ITransferKey } from '~/interfaces/transfer-key';

import loggerFactory from '../../utils/logger';

const logger = loggerFactory('growi:models:transfer-key');

const schema = new Schema<ITransferKey>({
  expireAt: { type: Date, default: () => new Date(), expires: '30m' },
  value: { type: String, unique: true },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

export default getOrCreateModel('TransferKey', schema);
