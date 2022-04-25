// Model
const MODEL_PAGE = 'Page';
const MODEL_COMMENT = 'Comment';

// Action
const ACTION_PAGE_LIKE = 'PAGE_LIKE';
const ACTION_PAGE_BOOKMARK = 'PAGE_BOOKMARK';
const ACTION_PAGE_UPDATE = 'PAGE_UPDATE';
const ACTION_PAGE_RENAME = 'PAGE_RENAME';
const ACTION_PAGE_DUPLICATE = 'PAGE_DUPLICATE';
const ACTION_PAGE_DELETE = 'PAGE_DELETE';
const ACTION_PAGE_DELETE_COMPLETELY = 'PAGE_DELETE_COMPLETELY';
const ACTION_PAGE_REVERT = 'PAGE_REVERT';
const ACTION_COMMENT_CREATE = 'COMMENT_CREATE';
const ACTION_COMMENT_UPDATE = 'COMMENT_UPDATE';

export const supportedTargetModelNames = {
  MODEL_PAGE,
} as const;

export const supportedEventModelNames = {
  MODEL_COMMENT,
} as const;

export const supportedActionNames = {
  ACTION_PAGE_LIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,
} as const;

// type supportedTargetModelType = typeof supportedTargetModelNames[keyof typeof supportedTargetModelNames];
// type supportedEventModelType = typeof supportedEventModelNames[keyof typeof supportedEventModelNames];
// type supportedActionType = typeof supportedActionNames[keyof typeof supportedActionNames];
