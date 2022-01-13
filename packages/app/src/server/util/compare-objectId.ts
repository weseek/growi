import mongoose from 'mongoose';

type TObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const filterIdsByIds = (_arr1: TObjectId[], _arr2: TObjectId[]): TObjectId[] => {
  // cast to string
  const arr1 = _arr1.map(e => e.toString());
  const arr2 = _arr2.map(e => e.toString());

  // filter
  const filtered = arr1.filter(e => !arr2.includes(e));

  // cast to ObjectId
  return filtered.map(e => new ObjectId(e));
};
