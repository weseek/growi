import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const compareObjectId = (_id1: IObjectId, _id2: IObjectId): boolean => {
  const id1 = _id1.toString();
  const id2 = _id2.toString();

  return id1 === id2;
};

export const includesObjectId = (_arr: IObjectId[], _id: IObjectId): boolean => {
  const arr = _arr.map(i => i.toString());
  const id = _id.toString();

  return arr.includes(id);
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
