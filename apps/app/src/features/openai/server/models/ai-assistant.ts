import {
  type IGrantedGroup, GroupType, type IPage, type IUser, type Ref,
} from '@growi/core';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

/*
*  Objects
*/
const AiAssistantType = {
  KNOWLEDGE: 'knowledge',
  // EDITOR: 'editor',
  // LEARNING: 'learning',
} as const;

const AiAssistantSharingScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;

const AiAssistantLearningScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;


/*
*  Interfaces
*/
type AiAssistantType = typeof AiAssistantType[keyof typeof AiAssistantType];
type AiAssistantSharingScope = typeof AiAssistantSharingScope[keyof typeof AiAssistantSharingScope];
type AiAssistantLearningScope = typeof AiAssistantLearningScope[keyof typeof AiAssistantLearningScope];

interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  vectorStoreId: string // VectorStoreId of OpenAI Specify (https://platform.openai.com/docs/api-reference/vector-stores/object)
  types: AiAssistantType[]
  owner: Ref<IUser>
  grantedGroups?: IGrantedGroup[];
  pages: Ref<IPage>[]
  sharingScope: AiAssistantSharingScope
  learningScope: AiAssistantLearningScope
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
    vectorStoreId: {
      type: String,
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
    pages: [{
      type: Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    }],
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
    sharingScope: {
      type: String,
      enum: Object.values(AiAssistantSharingScope),
      required: true,
    },
    learningScope: {
      type: String,
      enum: Object.values(AiAssistantLearningScope),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default getOrCreateModel<AiAssistantDocument, AiAssistantModel>('AiAssistant', schema);
