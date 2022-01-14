import mongoose from 'mongoose';

type IObjectId = mongoose.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const filterArr1ByArr2 = (arr1: IObjectId[], arr2: IObjectId[]): IObjectId[] => {
  // cast to string
  const arrToBeFiltered = arr1.map(e => e.toString());
  const arrToFilter = arr2.map(e => e.toString());

  // filter
  const filtered = arrToBeFiltered.filter(e => !arrToFilter.includes(e));

  // cast to ObjectId
  return filtered.map(e => new ObjectId(e));
};
