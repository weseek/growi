import mongoose from 'mongoose';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

/**
 * Check if array contains all specified ObjectIds
 * @param arr array that potentially contains potentialSubset
 * @param potentialSubset array that is potentially a subset of arr
 * @returns Whether or not arr includes all elements of potentialSubset
 */
export const includesObjectIds = (arr: ObjectIdLike[], potentialSubset: ObjectIdLike[]): boolean => {
  const _arr = arr.map(i => i.toString());
  const _potentialSubset = potentialSubset.map(i => i.toString());

  return _potentialSubset.every(id => _arr.includes(id));
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
