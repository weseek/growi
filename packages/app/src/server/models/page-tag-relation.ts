import { getOrCreateModel } from '@growi/core';
import {
  Types, Model, Schema,
} from 'mongoose';

import { ObjectIdLike } from '../interfaces/mongoose-utils';

import Tag, { TagDocument, TagIdToTagNameMap } from './tag';

const flatMap = require('array.prototype.flatmap');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');


export interface PageTagRelationDocument {
  _id: Types.ObjectId;
  relatedPage: Types.ObjectId,
  relatedTag: Types.ObjectId,
  isPageTrashed: boolean,
}

export interface PageTagRelationModel extends Model<PageTagRelationDocument>{
  createTagListWithCount(option)
  findByPageId(pageId: ObjectIdLike, options?)
  listTagNamesByPage(pageId: ObjectIdLike)
  getIdToTagNamesMap(pageIds: ObjectIdLike[])
  updatePageTags(pageId: ObjectIdLike, tags: TagDocument[])

}

export type PageIdToTagNamesMap = {[key: string] : string[] }

const pageTagRelationSchema = new Schema<PageTagRelationDocument, PageTagRelationModel>({
  relatedPage: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true,
    index: true,
  },
  relatedTag: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
    index: true,
  },
  isPageTrashed: {
    type: Boolean,
    default: false,
    required: true,
    index: true,
  },
});
// define unique compound index
pageTagRelationSchema.index({ relatedPage: 1, relatedTag: 1 }, { unique: true });
pageTagRelationSchema.plugin(mongoosePaginate);
pageTagRelationSchema.plugin(uniqueValidator);

pageTagRelationSchema.statics.createTagListWithCount = async function(option) {
  const opt = option || {};
  const sortOpt = opt.sortOpt || {};
  const offset = opt.offset;
  const limit = opt.limit;

  const tags = await this.aggregate()
    .match({ isPageTrashed: false })
    .lookup({
      from: 'tags',
      localField: 'relatedTag',
      foreignField: '_id',
      as: 'tag',
    })
    .unwind('$tag')
    .group({ _id: '$relatedTag', count: { $sum: 1 }, name: { $first: '$tag.name' } })
    .sort(sortOpt)
    .skip(offset)
    .limit(limit);

  const totalCount = (await this.find({ isPageTrashed: false }).distinct('relatedTag')).length;

  return { data: tags, totalCount };
};

pageTagRelationSchema.statics.findByPageId = async function(pageId: ObjectIdLike, options = {}) {
  const isAcceptRelatedTagNull = options.nullable || null;
  const relations = await this.find({ relatedPage: pageId }).populate('relatedTag').select('relatedTag');
  return isAcceptRelatedTagNull ? relations : relations.filter((relation) => { return relation.relatedTag !== null });
};

pageTagRelationSchema.statics.listTagNamesByPage = async function(pageId) {
  const relations = await this.findByPageId(pageId);
  return relations.map((relation) => { return relation.relatedTag.name });
};

/**
   * @return {object} key: Page._id, value: array of tag names
   */
pageTagRelationSchema.statics.getIdToTagNamesMap = async function(pageIds: ObjectIdLike[]): Promise<PageIdToTagNamesMap> {
  /**
     * @see https://docs.mongodb.com/manual/reference/operator/aggregation/group/#pivot-data
     *
     * results will be:
     * [
     *   { _id: 58dca7b2c435b3480098dbbc, tagIds: [ 5da630f71a677515601e36d7, 5da77163ec786e4fe43e0e3e ]},
     *   { _id: 58dca7b2c435b3480098dbbd, tagIds: [ ... ]},
     *   ...
     * ]
     */
  const results = await this.aggregate()
    .match({ relatedPage: { $in: pageIds } })
    .group({ _id: '$relatedPage', tagIds: { $push: '$relatedTag' } });

  if (results.length === 0) {
    return {};
  }

  results.flatMap = flatMap.shim(); // TODO: remove after upgrading to node v12

  // extract distinct tag ids
  const allTagIds = results
    .flatMap(result => result.tagIds); // map + flatten
  const distinctTagIds = Array.from(new Set(allTagIds));

  const tagIdToNameMap: TagIdToTagNameMap = await Tag.getIdToNameMap(distinctTagIds);

  // convert to map
  const idToTagNamesMap = {};
  results.forEach((result) => {
    const tagNames = result.tagIds
      .map(tagId => tagIdToNameMap[tagId])
      .filter(tagName => tagName != null); // filter null object

    idToTagNamesMap[result._id] = tagNames;
  });

  return idToTagNamesMap;
};

pageTagRelationSchema.statics.updatePageTags = async function(pageId: ObjectIdLike, tags) {
  if (pageId == null || tags == null) {
    throw new Error('args \'pageId\' and \'tags\' are required.');
  }

  // filter empty string
  // eslint-disable-next-line no-param-reassign
  tags = tags.filter((tag) => { return tag !== '' });

  // get relations for this page
  const relations = await this.findByPageId(pageId, { nullable: true });

  const unlinkTagRelationIds: ObjectIdLike[] = [];
  const relatedTagNames: string[] = [];

  relations.forEach((relation) => {
    if (relation.relatedTag == null) {
      unlinkTagRelationIds.push(relation._id);
    }
    else {
      relatedTagNames.push(relation.relatedTag.name);
      if (!tags.includes(relation.relatedTag.name)) {
        unlinkTagRelationIds.push(relation._id);
      }
    }
  });
  const bulkDeletePromise = this.deleteMany({ _id: { $in: unlinkTagRelationIds } });
  // find or create tags
  const tagsToCreate = tags.filter((tag) => { return !relatedTagNames.includes(tag) });
  const tagEntities = await Tag.findOrCreateMany(tagsToCreate);

  // create relations
  const bulkCreatePromise = this.insertMany(
    tagEntities.map((relatedTag) => {
      return {
        relatedPage: pageId,
        relatedTag,
      };
    }),
  );

  return Promise.all([bulkDeletePromise, bulkCreatePromise]);
};


export default getOrCreateModel<PageTagRelationDocument, PageTagRelationModel>('PageTagRelation', pageTagRelationSchema);
