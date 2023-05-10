import {
  Types, Model, Schema,
} from 'mongoose';

import { ObjectIdLike } from '../interfaces/mongoose-utils';
import { getOrCreateModel } from '../util/mongoose-utils';
import uniqueValidator from '../util/unique-validator-utils';

const mongoosePaginate = require('mongoose-paginate-v2');


export interface TagDocument {
  _id: Types.ObjectId;
  name: string;
}

export type IdToNameMap = {[key: string] : string }

export interface TagModel extends Model<TagDocument>{
  getIdToNameMap(tagIds: ObjectIdLike[]): IdToNameMap
  findOrCreateMany(tagNames: string[]): Promise<TagDocument[]>
}


const tagSchema = new Schema<TagDocument, TagModel>({
  name: {
    type: String,
    require: true,
    unique: true,
  },
});
tagSchema.plugin(mongoosePaginate);
tagSchema.plugin(uniqueValidator);


tagSchema.statics.getIdToNameMap = async function(tagIds: ObjectIdLike[]): Promise<IdToNameMap> {
  const tags = await this.find({ _id: { $in: tagIds } });

  const idToNameMap = {};
  tags.forEach((tag) => {
    idToNameMap[tag._id.toString()] = tag.name;
  });

  return idToNameMap;
};

tagSchema.statics.findOrCreateMany = async function(tagNames: string[]): Promise<TagDocument[]> {
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
};


export default getOrCreateModel<TagDocument, TagModel>('Tag', tagSchema);
