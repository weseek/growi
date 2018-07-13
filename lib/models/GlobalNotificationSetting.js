const debug = require('debug')('growi:models:GlobalNotificationSetting');
const mongoose = require('mongoose');

/**
 * parent schema in this model
 */
const notificationSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, required: true, default: true },
  triggerPath: { type: String, required: true },
  triggerEvents: { type: [String] },
});

/**
 * create child schemas inherited from parentSchema
 * all child schemas are stored in globalnotificationsettings collection
 * @link{http://url.com module_name}
 * @param {object} parentSchema
 * @param {string} modelName
 * @param {string} discriminatorKey
 */
const createChildSchemas = (parentSchema, modelName, discriminatorKey) => {
  const Notification = mongoose.model(modelName, parentSchema);
  const mailNotification = Notification.discriminator('mail', new mongoose.Schema({
    toEmail: String,
  }, {discriminatorKey: discriminatorKey}));

  const slackNotification = Notification.discriminator('slack', new mongoose.Schema({
    slackChannels: String,
  }, {discriminatorKey: discriminatorKey}));

  return {
    Parent: Notification,
    Mail: mailNotification,
    Slack: slackNotification,
  };
};


/**
 * GlobalNotificationSetting Class
 * @class GlobalNotificationSetting
 */
class GlobalNotificationSetting {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * disable notification setting
   * @param {string} id
   */
  static async toggleIsEnabled(id) {
    const setting = await this.findOne({_id: id});

    setting.isEnabled = !setting.isEnabled;
    setting.save();

    return setting;
  }

  /**
   * find all notification settings
   */
  static async findAll() {
    const settings = await this.find().sort({ triggerPath: 1 });

    return settings;
  }

  /**
   * find a list of notification settings by path and a list of events
   * @param {string} path
   * @param {string} event
   */
  static async findSettingByPathAndEvent(path, event) {
    const pathsToMatch = generatePathsToMatch(path);

    const settings = await this.find({
      triggerPath: {$in: pathsToMatch},
      triggerEvents: event,
      isEnabled: true
    })
    .sort({ triggerPath: 1 });

    return settings;
  }
}


// move this to util
// remove this from models/page
const cutOffLastSlash = path => {
  const lastSlash = path.lastIndexOf('/');
  return path.substr(0, lastSlash);
};

const generatePathsOnTree = (path, pathList) => {
  pathList.push(path);

  if (path === '') {
    return pathList;
  }

  const newPath = cutOffLastSlash(path);

  return generatePathsOnTree(newPath, pathList);
};

const generatePathsToMatch = (originalPath) => {
  const pathList = generatePathsOnTree(originalPath, []);
  return pathList.map(path => {
    if (path !== originalPath) {
      return path + '/*';
    }
    else {
      return path;
    }
  });
};

module.exports = function(crowi) {
  GlobalNotificationSetting.crowi = crowi;
  notificationSchema.loadClass(GlobalNotificationSetting);
  return createChildSchemas(notificationSchema, 'GlobalNotificationSetting', 'type');
};
