const MODEL_PAGE = 'Page';
const MODEL_COMMENT = 'Comment';

const ACTION_MODIFY = 'MODIFY';
const ACTION_COMMENT = 'COMMENT';
const ACTION_CREATE = 'CREATE'; // Not support yet
const ACTION_DELETE = 'DELETE'; // Not support yet
const ACTION_LIKE = 'LIKE'; // Not support yet

const getSupportTargetModelNames = () => {
  return [MODEL_PAGE];
};

const getSupportEventModelNames = () => {
  return [MODEL_COMMENT];
};

const getSupportActionNames = () => {
  return [
    // ACTION_CREATE,
    ACTION_MODIFY,
    // ACTION_DELETE,
    ACTION_COMMENT,
    // ACTION_LIKE,
  ];
};

const activityDefine = {
  MODEL_PAGE,
  MODEL_COMMENT,

  ACTION_CREATE, // Not support yet
  ACTION_MODIFY,
  ACTION_DELETE, // Not support yet
  ACTION_COMMENT,
  ACTION_LIKE,

  getSupportTargetModelNames,
  getSupportEventModelNames,
  getSupportActionNames,
};

export default activityDefine;
