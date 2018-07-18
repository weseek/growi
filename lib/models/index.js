'use strict';

module.exports = {
  Page: require('./page'),
  PageGroupRelation: require('./page-group-relation'),
  User: require('./user'),
  ExternalAccount: require('./external-account'),
  UserGroup: require('./user-group'),
  UserGroupRelation: require('./user-group-relation'),
  Revision: require('./revision'),
  Bookmark: require('./bookmark'),
  Comment: require('./comment'),
  Attachment: require('./attachment'),
  UpdatePost: require('./updatePost'),
  GlobalNotificationSetting: require('./GlobalNotificationSetting'),
  GlobalNotificationMailSetting: require('./GlobalNotificationSetting/GlobalNotificationMailSetting'),
  GlobalNotificationSlackSetting: require('./GlobalNotificationSetting/GlobalNotificationSlackSetting'),
};
