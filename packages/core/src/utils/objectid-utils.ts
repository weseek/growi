import ObjectId from 'bson-objectid';

import { isServer } from './browser-utils';

// Workaround to avoid https://github.com/williamkapke/bson-objectid/issues/50
if (isServer()) {
  global._Buffer = Buffer;
}

export function isValidObjectId(id: string | ObjectId | null | undefined): boolean {
  if (id == null) {
    return false;
  }

  // implement according to https://www.geeksforgeeks.org/how-to-check-if-a-string-is-valid-mongodb-objectid-in-node-js/
  if (typeof id === 'string') {
    return ObjectId.isValid(id) && new ObjectId(id).toHexString() === id;
  }

  return ObjectId.isValid(id);
}
