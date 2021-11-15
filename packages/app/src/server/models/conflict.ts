import { truncate } from 'fs/promises';
import { Types, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const mongoose = require('mongoose');

interface IRevisionOnConflict {
  id: string,
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

module.exports = function(crowi) {

  const schema = new Schema<IConflict>({
    path: { type: String, required: true, uniquer: true },
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
        createdAt: { type: Date, required: truncate },
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

  return mongoose.model('Conflict', schema);

};
