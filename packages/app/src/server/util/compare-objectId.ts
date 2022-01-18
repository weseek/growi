import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

const castToString = (val: string | IObjectId) => {
  if (typeof val === 'string') {
    return val;
  }

  return val.toString();
};

export const compareObjectId = (id1: IObjectId | string, id2: IObjectId | string): boolean => {
  return castToString(id1) === castToString(id2);
};

export const isIncludesObjectId = (arr: (IObjectId | string)[], id: IObjectId | string): boolean => {
  const _arr = arr.map(i => castToString(i));
  const _id = castToString(id);

  return _arr.includes(_id);
};

/**
 * Exclude ObjectIds which exist in testIds from targetIds
 * @param targetIds Array of mongoose.Types.ObjectId
 * @param testIds Array of mongoose.Types.ObjectId
 * @returns Array of mongoose.Types.ObjectId
 */
export const excludeTestIdsFromTargetIds = (targetIds: (IObjectId | string)[], testIds: (IObjectId | string)[]): IObjectId[] => {
  // cast to string
  const arr1 = targetIds.map(e => castToString(e));
  const arr2 = testIds.map(e => castToString(e));

  // filter
  const excluded = arr1.filter(e => !arr2.includes(e));

  // cast to ObjectId
  return excluded.map(e => new ObjectId(e));
};

export const removeDuplicates = (objectIds: (IObjectId | string)[]): IObjectId[] => {
  // cast to string
  const strs = objectIds.map(id => castToString(id));
  const uniqueArr = Array.from(new Set(strs));

  // cast to ObjectId
  return uniqueArr.map(str => new ObjectId(str));
};
