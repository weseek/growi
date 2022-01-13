import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const filterIdsByIds = (_arr1: IObjectId[], _arr2: IObjectId[]): IObjectId[] => {
  // cast to string
  const arr1 = _arr1.map(e => e.toString());
  const arr2 = _arr2.map(e => e.toString());

  // filter
  const filtered = arr1.filter(e => !arr2.includes(e));

  // cast to ObjectId
  return filtered.map(e => new ObjectId(e));
};
