import { Binary } from 'mongodb';
import { Types } from 'mongoose';

import type { OverwriteParams } from '../import-settings';


const { ObjectId } = Types;

export const overwriteParams: OverwriteParams = {
  // Date
  files_id: (value, { document, schema, propertyName }) => {
    return new ObjectId(value);
  },

  // Binary
  data: (value, { document, schema, propertyName }) => {
    return new Binary(value);
  },
};
