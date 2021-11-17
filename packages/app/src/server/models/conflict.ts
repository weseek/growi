import { Types, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getOrCreateModel } from '@growi/core';
import { IRevisionOnConflict } from '~/interfaces/revision';

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
      revisionId: { type: String },
      revisionBody: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
    origin: {
      revisionId: { type: String },
      revisionBody: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
    latest: {
      revisionId: { type: String },
      revisionBody: { type: String, required: true },
      userName: { type: String, required: true },
      userImgPath: { type: String, required: true },
      createdAt: { type: Date, required: true },
    },
  },
});

schema.plugin(uniqueValidator);

export default getOrCreateModel<IConflict, IRevisionOnConflict>('Conflict', schema);
