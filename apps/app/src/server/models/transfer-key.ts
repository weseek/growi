import { Model, Schema, HydratedDocument } from 'mongoose';

import { ITransferKey } from '~/interfaces/transfer-key';

import { getOrCreateModel } from '../util/mongoose-utils';

interface ITransferKeyMethods {
  findOneActiveTransferKey(key: string): Promise<HydratedDocument<ITransferKey, ITransferKeyMethods> | null>;
}

type TransferKeyModel = Model<ITransferKey, any, ITransferKeyMethods>;

export interface TransferKeyDocument extends ITransferKey, TransferKeyModel, ITransferKeyMethods {}

const schema = new Schema<TransferKeyDocument>({
  expireAt: { type: Date, default: () => new Date(), expires: '30m' },
  keyString: { type: String, unique: true }, // original key string
  key: { type: String, unique: true },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

// TODO: validate createdAt
schema.statics.findOneActiveTransferKey = async function(key: string): Promise<HydratedDocument<ITransferKey, ITransferKeyMethods> | null> {
  return this.findOne({ key });
};

export default getOrCreateModel<TransferKeyDocument, TransferKeyModel>('TransferKey', schema);
