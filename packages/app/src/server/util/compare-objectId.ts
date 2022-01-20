import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const compareObjectId = (id1: IObjectId, id2: IObjectId): boolean => {
  return id1.toString() === id2.toString();
};

export const isIncludesObjectId = (arr: IObjectId[], id: IObjectId): boolean => {
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
export const excludeTestIdsFromTargetIds = (targetIds: IObjectId[], testIds: IObjectId[]): IObjectId[] => {
  // cast to string
  const arr1 = targetIds.map(e => e.toString());
  const arr2 = testIds.map(e => e.toString());

  // filter
  const excluded = arr2.filter(e => !arr1.includes(e));

  // cast to ObjectId
  return excluded.map(e => new ObjectId(e));
};
