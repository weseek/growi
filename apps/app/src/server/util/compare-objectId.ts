import mongoose from 'mongoose';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const isIncludesObjectId = (arr: ObjectIdLike[], id: ObjectIdLike): boolean => {
  const _arr = arr.map(i => i.toString());
  const _id = id.toString();

  return _arr.includes(_id);
};

// Check if two arrays have an intersection
export const hasIntersection = (arr: ObjectIdLike[], arr2: ObjectIdLike[]): boolean => {
  const _arr = arr.map(i => i.toString());
  const _arr2 = arr2.map(i => i.toString());
  return _arr.some(item => _arr2.includes(item));
};

/**
 * Exclude ObjectIds which exist in testIds from targetIds
 * @param targetIds Array of mongoose.Types.ObjectId
 * @param testIds Array of mongoose.Types.ObjectId
 * @returns Array of mongoose.Types.ObjectId
 */
export const excludeTestIdsFromTargetIds = <T extends { toString: any } = IObjectId>(
  targetIds: T[], testIds: ObjectIdLike[],
): T[] => {
  // cast to string
  const arr1 = targetIds.map(e => e.toString());
  const arr2 = testIds.map(e => e.toString());

  // filter
  const excluded = arr1.filter(e => !arr2.includes(e));
  // cast to ObjectId
  const shouldReturnString = (arr: any[]): arr is string[] => {
    return typeof arr[0] === 'string';
  };

  return shouldReturnString(targetIds) ? excluded : excluded.map(e => new ObjectId(e));
};
