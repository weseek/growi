import {
  type IGrantedGroup, GroupType, type IUser, type Ref,
} from '@growi/core';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import type { VectorStore } from './vector-store';

/*
*  Objects
*/
const AiAssistantType = {
  KNOWLEDGE: 'knowledge',
  // EDITOR: 'editor',
  // LEARNING: 'learning',
} as const;

const AiAssistantShareScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;

const AiAssistantOwnerAccessScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;


/*
*  Interfaces
*/
type AiAssistantType = typeof AiAssistantType[keyof typeof AiAssistantType];
type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
type AiAssistantOwnerAccessScope = typeof AiAssistantOwnerAccessScope[keyof typeof AiAssistantOwnerAccessScope];

interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  pagePaths: string[],
  vectorStore: Ref<VectorStore>
  types: AiAssistantType[]
  owner: Ref<IUser>
  grantedUsers?: IUser[]
  grantedGroups?: IGrantedGroup[]
  shareScope: AiAssistantShareScope
  ownerAccessScope: AiAssistantOwnerAccessScope
}

interface AiAssistantDocument extends AiAssistant, Document {}

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
    pagePaths: [{
      type: String,
      required: true,
    }],
    vectorStore: {
      type: Schema.Types.ObjectId,
      ref: 'VectorStore',
      required: true,
    },
    types: [{
      type: String,
      enum: Object.values(AiAssistantType),
      required: true,
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    grantedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
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
    ownerAccessScope: {
      type: String,
      enum: Object.values(AiAssistantOwnerAccessScope),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default getOrCreateModel<AiAssistantDocument, AiAssistantModel>('AiAssistant', schema);
