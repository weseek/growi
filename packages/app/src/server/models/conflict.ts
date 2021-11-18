import { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { getOrCreateModel } from '@growi/core';
import { IRevisionOnConflict } from '~/interfaces/revision';

type IConflictSchema = {
  path: string;
  revisions: {
    request: IRevisionOnConflict,
    origin: IRevisionOnConflict,
    latest: IRevisionOnConflict,
  };
};


const revisionSchema = {
  revisionId: { type: String },
  revisionBody: { type: String, required: true },
  userName: { type: String, required: true },
  userImgPath: { type: String, required: true },
  createdAt: { type: Date, required: true },
};

const schema = new Schema<IConflictSchema>({
  path: { type: String, required: true, unique: true },
  revisions: {
    request: revisionSchema,
    origin: revisionSchema,
    latest: revisionSchema,
  },
});

schema.plugin(uniqueValidator);

export default getOrCreateModel<IConflictSchema, IRevisionOnConflict>('Conflict', schema);
