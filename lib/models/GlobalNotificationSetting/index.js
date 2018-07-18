const mongoose = require('mongoose');

/**
 * parent schema for GlobalNotificationSetting model
 */
const globalNotificationSettingSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, required: true, default: true },
  triggerPath: { type: String, required: true },
  triggerEvents: { type: [String] },
});


/**
 * GlobalNotificationSetting Class
 * @class GlobalNotificationSetting
 */
class GlobalNotificationSetting {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * enable notification setting
   * @param {string} id
   */
  static async enable(id) {
    const setting = await this.findOne({_id: id});

    setting.isEnabled = true;
    setting.save();

    return setting;
  }

  /**
   * disable notification setting
   * @param {string} id
   */
  static async disable(id) {
    const setting = await this.findOne({_id: id});

    setting.isEnabled = false;
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


module.exports = {
  class: GlobalNotificationSetting,
  schema: globalNotificationSettingSchema,
};
