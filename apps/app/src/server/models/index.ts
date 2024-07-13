import GlobalNotificationSetting from './GlobalNotificationSetting';
import GlobalNotificationMailSetting from './GlobalNotificationSetting/GlobalNotificationMailSetting';
import GlobalNotificationSlackSetting from './GlobalNotificationSetting/GlobalNotificationSlackSetting';
import Bookmark from './bookmark';
import Page from './page';
import SlackAppIntegration from './slack-app-integration';
import User from './user';

export const modelsDependsOnCrowi = {
  Page,
  User,
  Bookmark,
  GlobalNotificationSetting,
  GlobalNotificationMailSetting,
  GlobalNotificationSlackSetting,
  SlackAppIntegration,
};

// setup models that independent from crowi
export * from './attachment';
export * as Activity from './activity';
export * as PageRedirect from './page-redirect';
export * from './revision';
export * as ShareLink from './share-link';
export * as Tag from './tag';
export * as UserGroup from './user-group';
export * as PageTagRelation from './page-tag-relation';
