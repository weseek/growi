import { Model, Schema, HydratedDocument } from 'mongoose';

import { ITransferKey } from '~/interfaces/transfer-key';

import loggerFactory from '../../utils/logger';
import { getOrCreateModel } from '../util/mongoose-utils';

const logger = loggerFactory('growi:models:transfer-key');

interface ITransferKeyMethods {
  findOneActiveTransferKey(transferKeyString: string): Promise<HydratedDocument<ITransferKey, ITransferKeyMethods> | null>;
}

type TransferKeyModel = Model<ITransferKey, {}, ITransferKeyMethods>;

const schema = new Schema<ITransferKey, TransferKeyModel, ITransferKeyMethods>({
  expireAt: { type: Date, default: () => new Date(), expires: '30m' },
  value: { type: String, unique: true },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

schema.statics.findOneActiveTransferKey = async function(transferKeyString: string): Promise<HydratedDocument<ITransferKey, ITransferKeyMethods> | null> {
  let tk: HydratedDocument<ITransferKey, ITransferKeyMethods> | null;
  try {
    tk = await this.findOne({ value: transferKeyString });
  }
  catch (err) {
    logger.error(err);
    throw err;
  }

  return tk;
};

export default getOrCreateModel('TransferKey', schema);
