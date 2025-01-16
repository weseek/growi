import { type IGrantedGroup, GroupType } from '@growi/core';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import { type AiAssistant, AiAssistantShareScope, AiAssistantAccessScope } from '../../interfaces/ai-assistant';

export interface AiAssistantDocument extends AiAssistant, Document {}

type AiAssistantModel = Model<AiAssistantDocument>


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
    grantedGroups: {
      type: [{
        type: {
          type: String,
          enum: Object.values(GroupType),
          required: true,
          default: 'UserGroup',
        },
        item: {
          type: Schema.Types.ObjectId,
          refPath: 'grantedGroups.type',
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

export default getOrCreateModel<AiAssistantDocument, AiAssistantModel>('AiAssistant', schema);
