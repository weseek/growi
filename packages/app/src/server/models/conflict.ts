import { Types, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getOrCreateModel } from '@growi/core';

interface IRevisionOnConflict {
  id: Types.ObjectId;
  body: string,
  userName: string,
  userImgPath: string,
  createdAt: Date;
}

type IConflict = {
  path: string;
  revisions: {
    request: IRevisionOnConflict,
    origin: IRevisionOnConflict,
    latest: IRevisionOnConflict,
  };
};


const schema = new Schema<IConflict>({
  path: { type: String, required: true, unique: true },
  revisions: {
    request: {
      id: { type: String },
      body: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
    origin: {
      id: { type: String },
      body: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
    latest: {
      id: { type: String },
      body: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
  },
});

schema.plugin(uniqueValidator);

export default getOrCreateModel<IConflict, IRevisionOnConflict>('Conflict', schema);
