import { HasObjectId } from './has-object-id';
import { IUser } from './user';

// Model
const MODEL_PAGE = 'Page';

// Action
const ACTION_PAGE_LIKE = 'PAGE_LIKE';
const ACTION_PAGE_BOOKMARK = 'PAGE_BOOKMARK';
const ACTION_PAGE_CREATE = 'PAGE_CREATE';
const ACTION_PAGE_UPDATE = 'PAGE_UPDATE';
const ACTION_PAGE_RENAME = 'PAGE_RENAME';
const ACTION_PAGE_DUPLICATE = 'PAGE_DUPLICATE';
const ACTION_PAGE_DELETE = 'PAGE_DELETE';
const ACTION_PAGE_DELETE_COMPLETELY = 'PAGE_DELETE_COMPLETELY';
const ACTION_PAGE_REVERT = 'PAGE_REVERT';
const ACTION_COMMENT_CREATE = 'COMMENT_CREATE';
const ACTION_COMMENT_UPDATE = 'COMMENT_UPDATE';


export const SUPPORTED_TARGET_MODEL_TYPE = {
  MODEL_PAGE,
} as const;

export const SUPPORTED_ACTION_TYPE = {
  ACTION_PAGE_LIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_CREATE,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,
} as const;


export const AllSupportedTargetModelType = Object.values(SUPPORTED_TARGET_MODEL_TYPE);
export const AllSupportedActionType = Object.values(SUPPORTED_ACTION_TYPE);

/*
 * For AuditLogManagement.tsx
 */
export const PageActions = Object.values({
  ACTION_PAGE_LIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_CREATE,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
} as const);

export const CommentActions = Object.values({
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,
} as const);


export type SupportedTargetModelType = typeof SUPPORTED_TARGET_MODEL_TYPE[keyof typeof SUPPORTED_TARGET_MODEL_TYPE];
// type supportedEventModelType = typeof SUPPORTED_EVENT_MODEL_TYPE[keyof typeof SUPPORTED_EVENT_MODEL_TYPE];
export type SupportedActionType = typeof SUPPORTED_ACTION_TYPE[keyof typeof SUPPORTED_ACTION_TYPE];


export type ISnapshot = Partial<Pick<IUser, 'username'>>

export type IActivity = {
  user?: IUser
  targetModel?: SupportedTargetModelType
  target?: string
  action?: SupportedActionType
  createdAt: Date
  snapshot?: ISnapshot
}

export type IActivityHasId = IActivity & HasObjectId;
