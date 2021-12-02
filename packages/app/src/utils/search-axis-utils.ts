
const SORT_AXIS_CONSTS = {
  score: '_score',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

type SORT_AXIS = typeof SORT_AXIS_CONSTS[keyof typeof SORT_AXIS_CONSTS];

const SORT_ORDER_CONSTS = {
  desc: 'desc',
  asc: 'asc',
};
type SORT_ORDER = typeof SORT_ORDER_CONSTS[keyof typeof SORT_ORDER_CONSTS];

export type {
  SORT_AXIS,
  SORT_ORDER,
};

export {
  SORT_AXIS_CONSTS,
  SORT_ORDER_CONSTS,
};
