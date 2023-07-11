import Page from '~/server/models/page';

module.exports = {
  Page,
  // TODO GW-2746 bulk export pages
  // PageArchive: require('./page-archive'),
  PageTagRelation: require('./page-tag-relation'),
  User: require('./user'),
  Revision: require('./revision'),
  Bookmark: require('./bookmark'),
  Comment: require('./comment'),
  Attachment: require('./attachment'),
  GlobalNotificationSetting: require('./GlobalNotificationSetting'),
  GlobalNotificationMailSetting: require('./GlobalNotificationSetting/GlobalNotificationMailSetting'),
  GlobalNotificationSlackSetting: require('./GlobalNotificationSetting/GlobalNotificationSlackSetting'),
  ShareLink: require('./share-link'),
  SlackAppIntegration: require('./slack-app-integration'),
};
