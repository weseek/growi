import Page from '~/server/models/page';

module.exports = {
  Page,
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
