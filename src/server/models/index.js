module.exports = {
  // Config: require('./config'),
  Page: require('./page'),
  // TODO GW-2746 bulk export pages
  // PageArchive: require('./page-archive'),
  PageTagRelation: require('./page-tag-relation'),
  ExternalAccount: require('./external-account'),
  Revision: require('./revision'),
  Tag: require('./tag'),
  Comment: require('./comment'),
  Attachment: require('./attachment'),
  UpdatePost: require('./updatePost'),
  GlobalNotificationSetting: require('./GlobalNotificationSetting'),
  GlobalNotificationMailSetting: require('./GlobalNotificationSetting/GlobalNotificationMailSetting'),
  GlobalNotificationSlackSetting: require('./GlobalNotificationSetting/GlobalNotificationSlackSetting'),
};
