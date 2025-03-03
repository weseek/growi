import { type IGrantedGroup, GroupType } from '@growi/core';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { type AiAssistant, AiAssistantShareScope, AiAssistantAccessScope } from '../../interfaces/ai-assistant';
import { generateGlobPatterns } from '../utils/generate-glob-patterns';

export interface AiAssistantDocument extends AiAssistant, Document {}

interface AiAssistantModel extends Model<AiAssistantDocument> {
  findByPagePaths(pagePaths: string[]): Promise<AiAssistantDocument[]>;
}

/*
 * Schema Definition
 */
const schema = new Schema<AiAssistantDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
    additionalInstruction: {
      type: String,
      required: true,
      default: '',
    },
    pagePathPatterns: [{
      type: String,
      required: true,
    }],
    vectorStore: {
      type: Schema.Types.ObjectId,
      ref: 'VectorStore',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    grantedGroupsForShareScope: {
      type: [{
        type: {
          type: String,
          enum: Object.values(GroupType),
          required: true,
          default: 'UserGroup',
        },
        item: {
          type: Schema.Types.ObjectId,
          refPath: 'grantedGroupsForShareScope.type',
          required: true,
          index: true,
        },
      }],
      validate: [function(arr: IGrantedGroup[]): boolean {
        if (arr == null) return true;
        const uniqueItemValues = new Set(arr.map(e => e.item));
        return arr.length === uniqueItemValues.size;
      }, 'grantedGroups contains non unique item'],
      default: [],
    },
    grantedGroupsForAccessScope: {
      type: [{
        type: {
          type: String,
          enum: Object.values(GroupType),
          required: true,
          default: 'UserGroup',
        },
        item: {
          type: Schema.Types.ObjectId,
          refPath: 'grantedGroupsForAccessScope.type',
          required: true,
          index: true,
        },
      }],
      validate: [function(arr: IGrantedGroup[]): boolean {
        if (arr == null) return true;
        const uniqueItemValues = new Set(arr.map(e => e.item));
        return arr.length === uniqueItemValues.size;
      }, 'grantedGroups contains non unique item'],
      default: [],
    },
    shareScope: {
      type: String,
      enum: Object.values(AiAssistantShareScope),
      required: true,
    },
    accessScope: {
      type: String,
      enum: Object.values(AiAssistantAccessScope),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


schema.statics.findByPagePaths = async function(pagePaths: string[]): Promise<AiAssistantDocument[]> {
  const pagePathsWithGlobPattern = pagePaths.map(pagePath => generateGlobPatterns(pagePath)).flat();
  const assistants = await this.find({
    $or: [
      // Case 1: Exact match
      { pagePathPatterns: { $in: pagePaths } },
      // Case 2: Glob pattern match
      { pagePathPatterns: { $in: pagePathsWithGlobPattern } },
    ],
  }).populate('vectorStore');

  return assistants;
};

export default getOrCreateModel<AiAssistantDocument, AiAssistantModel>('AiAssistant', schema);
