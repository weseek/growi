import { Schema, Model } from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';
import uniqueValidator from 'mongoose-unique-validator';

import { getOrCreateModel } from '../util/mongoose-utils';
import { Tag as ITag } from '~/interfaces/page';

/*
 * define methods type
 */
interface ModelMethods {
  getIdToNameMap(tagIds:Schema.Types.ObjectId[]): {[key:string]:string}
  findOrCreateMany(tagsToCreate:ITag): ITag[]
}

/*
 * define schema
 */
const schema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});
schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

/**
 * Tag Class
 *
 * @class Tag
 */
class Tag extends Model {

  static async getIdToNameMap(tagIds) {
    const tags = await this.find({ _id: { $in: tagIds } });

    const idToNameMap = {};
    tags.forEach((tag) => {
      idToNameMap[tag._id.toString()] = tag.name;
    });

    return idToNameMap;
  }

  static async findOrCreate(tagName) {
    const tag = await this.findOne({ name: tagName });
    if (!tag) {
      return this.create({ name: tagName });
    }
    return tag;
  }

  static async findOrCreateMany(tagNames) {
    const existTags = await this.find({ name: { $in: tagNames } });
    const existTagNames = existTags.map((tag) => { return tag.name });

    // bulk insert
    const tagsToCreate = tagNames.filter((tagName) => { return !existTagNames.includes(tagName) });
    await this.insertMany(
      tagsToCreate.map((tag) => {
        return { name: tag };
      }),
    );

    return this.find({ name: { $in: tagNames } });
  }

}

schema.loadClass(Tag);
export default getOrCreateModel<ITag, ModelMethods>('Tag', schema);
