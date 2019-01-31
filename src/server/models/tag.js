// const debug = require('debug')('growi:models:tag');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
// const ObjectId = mongoose.Schema.Types.ObjectId;


/*
 * define schema
 */
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
schema.plugin(mongoosePaginate);

class Tag {

  /**
   * public fields for Tag model
   *
   * @readonly
   * @static
   * @memberof Tag
   */
  static get TAG_PUBLIC_FIELDS() {
    return 'name';
  }

  // /**
  //  * limit items num for pagination
  //  *
  //  * @readonly
  //  * @static
  //  * @memberof UserGroup
  //  */
  // static get PAGE_ITEMS() {
  //   return 10;
  // }

  /*
   * model static methods
   */

  // すべてのタグを取得（オプション指定可）
  static findAllTags(option) {
    return this.find().exec();
  }

  // /**
  //  * find all entities with pagination
  //  *
  //  * @see https://github.com/edwardhotchkiss/mongoose-paginate
  //  *
  //  * @static
  //  * @param {any} opts mongoose-paginate options object
  //  * @returns {Promise<any>} mongoose-paginate result object
  //  * @memberof Tag
  //  */
  // static findTagsWithPagination(opts) {
  //   const query = {};
  //   const options = Object.assign({}, opts);
  //   if (options.page == null) {
  //     options.page = 1;
  //   }
  //   if (options.limit == null) {
  //     options.limit = Tag.PAGE_ITEMS;
  //   }

  //   return this.paginate(query, options)
  //     .catch((err) => {
  //       debug('Error on pagination:', err);
  //     });
  // }

  // // 作成可能なタグ名かの判別
  // static isRegisterableName(name) {
  //   const query = { name: name };

  //   return this.findOne(query)
  //     .then((userGroupData) => {
  //       return (userGroupData == null);
  //     });
  // }

  // // タグ削除
  // static removeTag(name) {
  //   const PageTagRelation = mongoose.model('PageTagRelation');

  //   let removed = undefined;
  //   return this.find({name: name})
  //     .then(pageTagData => {
  //       if (pageTagData == null) {
  //         throw new Exception('UserGroup data is not exists. id:', id);
  //       }
  //       return pageTagData.remove();
  //     })
  //     .then(removedPageTagData => {
  //       removed = removedPageTagData;
  //     })
  //     // remove relations
  //     .then(() => {
  //       return Promise.all([
  //         PageTagRelation.removeAllByUserGroup(removed),
  //       ]);
  //     });
  // }

  // タグ生成
  static createTag(name) {
    return this.create({name: name});
  }
}

module.exports = function(crowi) {
  Tag.crowi = crowi;
  schema.loadClass(Tag);
  return mongoose.model('Tag', schema);
};

