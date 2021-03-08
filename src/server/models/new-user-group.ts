import { Schema, Types, Model } from 'mongoose';


import mongoosePaginate from 'mongoose-paginate-v2';
import Debug from 'debug';
import { getOrCreateModel } from '../util/mongoose-utils';
import { UserGroup as IUserGroup } from '~/interfaces/user';

import ConfigManager from '~/server/service/config-manager';
// import { PageServise } from '~/server/service/page';

const debug = Debug('growi:models:userGroup');


/*
 * define schema
 */
const schema:Schema<IUserGroup & Document> = new Schema<IUserGroup & Document>({
  userGroupId: String,
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});
schema.plugin(mongoosePaginate);

/**
 * UserGroup Class
 *
 * @class UserGroup
 */
class UserGroup extends Model {

  // static pageService: PageServise;

  static paginate: (query, options)=>Promise<IUserGroup[]>;

  constructor() {
    super();
    this.configManager = new ConfigManager();
    // this.pageService = new PageServise(this.configManager);
  }

  /**
   * public fields for UserGroup model
   *
   * @readonly
   * @static
   * @memberof UserGroup
   */
  static get USER_GROUP_PUBLIC_FIELDS() {
    return '_id name createdAt';
  }

  /**
   * limit items num for pagination
   *
   * @readonly
   * @static
   * @memberof UserGroup
   */
  static get PAGE_ITEMS() {
    return 10;
  }

  /*
   * model static methods
   */

  // グループ画像パスの生成
  static createUserGroupPictureFilePath(userGroup, name) {
    const ext = `.${name.match(/(.*)(?:\.([^.]+$))/)[2]}`;

    return `userGroup/${userGroup._id}${ext}`;
  }

  // すべてのグループを取得（オプション指定可）
  static findAllGroups(_option) {
    return this.find().exec();
  }

  /**
   * find all entities with pagination
   *
   * @see https://github.com/edwardhotchkiss/mongoose-paginate
   *
   * @static
   * @param {any} opts mongoose-paginate options object
   * @returns {Promise<any>} mongoose-paginate result object
   * @memberof UserGroup
   */
  static findUserGroupsWithPagination(opts) {
    const query = {};
    const options = Object.assign({}, opts);
    if (options.page == null) {
      options.page = 1;
    }
    if (options.limit == null) {
      options.limit = UserGroup.PAGE_ITEMS;
    }

    return this.paginate(query, options)
      .catch((err) => {
        debug('Error on pagination:', err);
      });
  }

  // 登録可能グループ名確認
  static isRegisterableName(name) {
    const query = { name };

    return this.findOne(query)
      .then((userGroupData) => {
        return (userGroupData == null);
      });
  }

  // グループの完全削除
  static async removeCompletelyById(deleteGroupId, action, transferToUserGroupId) {
    const groupToDelete = await this.findById(deleteGroupId);
    if (groupToDelete == null) {
      throw new Error(`UserGroup data is not exists. id: ${deleteGroupId}`);
    }
    const deletedGroup = await groupToDelete.remove();

    await Promise.all([
      // TODO fix
      // UserGroupRelation.removeAllByUserGroup(deletedGroup),
      // this.pageService.handlePrivatePagesForDeletedGroup(deletedGroup, action, transferToUserGroupId),
    ]);

    return deletedGroup;
  }

  static countUserGroups() {
    return this.estimatedDocumentCount();
  }

  // グループ生成（名前が要る）
  static createGroupByName(name) {
    return this.create({ name });
  }

  // グループ名の更新
  async updateName(name) {
    // 名前を設定して更新
    this.name = name;
    await this.save();
  }

}


schema.loadClass(UserGroup);
export default getOrCreateModel<IUserGroup & Document>('UserGroup', schema);
