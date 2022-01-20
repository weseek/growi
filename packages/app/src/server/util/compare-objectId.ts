import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const isIncludesObjectId = (arr: (IObjectId | string)[], id: IObjectId | string): boolean => {
  const _arr = arr.map(i => i.toString());
  const _id = id.toString();

  return _arr.includes(_id);
};

/**
 * Exclude ObjectIds which exist in testIds from targetIds
 * @param targetIds Array of mongoose.Types.ObjectId
 * @param testIds Array of mongoose.Types.ObjectId
 * @returns Array of mongoose.Types.ObjectId
 */
export const excludeTestIdsFromTargetIds = <T extends { toString: any } = IObjectId>(
  targetIds: T[], testIds: (IObjectId | string)[],
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

export const removeDuplicates = (objectIds: (IObjectId | string)[]): IObjectId[] => {
  // cast to string
  const strs = objectIds.map(id => id.toString());
  const uniqueArr = Array.from(new Set(strs));

  // cast to ObjectId
  return uniqueArr.map(str => new ObjectId(str));
};
