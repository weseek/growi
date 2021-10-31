const MODEL_PAGE = 'Page';
const MODEL_COMMENT = 'Comment';

const ACTION_PAGE_UPDATE = 'PAGE_UPDATE';
const ACTION_COMMENT_CREATE = 'COMMENT_CREATE';
const ACTION_COMMENT_UPDATE = 'COMMENT_UPDATE';

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
  ];
};

const activityDefine = {
  MODEL_PAGE,
  MODEL_COMMENT,

  ACTION_PAGE_UPDATE,
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,

  getSupportTargetModelNames,
  getSupportEventModelNames,
  getSupportActionNames,
};

export default activityDefine;
