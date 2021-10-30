const MODEL_PAGE = 'Page';
const MODEL_COMMENT = 'Comment';

const ACTION_PAGE_UPDATE = 'PAGE_UPDATE';
const ACTION_COMMENT_CREATE = 'COMMENT_CREATE';
const ACTION_COMMENT_UPDATE = 'COMMENT_UPDATE';

// const ACTION_UPDATE = 'UPDATE';
// const ACTION_COMMENT = 'COMMENT';
// const ACTION_CREATE = 'CREATE'; // Not support yet
// const ACTION_DELETE = 'DELETE'; // Not support yet
// const ACTION_LIKE = 'LIKE'; // Not support yet

const getSupportTargetModelNames = () => {
  return [MODEL_PAGE];
};

const getSupportEventModelNames = () => {
  return [MODEL_COMMENT];
};

const getSupportActionNames = () => {
  return [
    ACTION_PAGE_UPDATE,
    ACTION_COMMENT_CREATE,
    ACTION_COMMENT_UPDATE,
    // ACTION_UPDATE,
    // ACTION_DELETE,
    // ACTION_COMMENT,
    // ACTION_LIKE,
  ];
};

const activityDefine = {
  MODEL_PAGE,
  MODEL_COMMENT,

  ACTION_PAGE_UPDATE,
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,

  // ACTION_CREATE, // Not support yet
  // ACTION_UPDATE,
  // ACTION_DELETE, // Not support yet
  // ACTION_COMMENT,
  // ACTION_LIKE,

  getSupportTargetModelNames,
  getSupportEventModelNames,
  getSupportActionNames,
};

export default activityDefine;
