import { Document } from 'mongoose';

export interface ITransferKey<ID = string> extends Document{
  _id: ID
  expireAt: Date
  keyString: string,
  key: string,
}
