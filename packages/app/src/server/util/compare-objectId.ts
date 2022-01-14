import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const compareObjectId = (id1: IObjectId, id2: IObjectId): boolean => {
  return id1.toString() === id2.toString();
};

export const includesObjectId = (arr: IObjectId[], id: IObjectId): boolean => {
  const _arr = arr.map(i => i.toString());
  const _id = id.toString();

  return _arr.includes(_id);
};

export const filterArr1ByArr2 = (arr1: IObjectId[], arr2: IObjectId[]): IObjectId[] => {
  // cast to string
  const arrToBeFiltered = arr1.map(e => e.toString());
  const arrToFilter = arr2.map(e => e.toString());

  // filter
  const filtered = arrToBeFiltered.filter(e => !arrToFilter.includes(e));

  // cast to ObjectId
  return filtered.map(e => new ObjectId(e));
};
