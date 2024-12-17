import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

/*
*  AiAssistant Objects
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
*  AiAssistant interfaces
*/
type AiAssistantType = typeof AiAssistantType[keyof typeof AiAssistantType];
type AiAssistantSharingScope = typeof AiAssistantSharingScope[keyof typeof AiAssistantSharingScope];
type AiAssistantLearningScope = typeof AiAssistantLearningScope[keyof typeof AiAssistantLearningScope];

interface AiAssistant {
  name: string;
  description?: string
  instruction?: string
  vectorStoreId: string // VectorStoreId of OpenAI Specify (https://platform.openai.com/docs/api-reference/vector-stores/object)
  type: AiAssistantType[]
  pages: mongoose.Types.ObjectId[]
  sharingScope: AiAssistantSharingScope
  learningScope: AiAssistantLearningScope
}

interface AiAssistantDocument extends AiAssistant, Document {}

type AiAssistantModel = Model<AiAssistantDocument>


/*
*  AiAssistant Schema
*/
const schema = new Schema<AiAssistantDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    instruction: {
      type: String,
    },
    vectorStoreId: {
      type: String,
      required: true,
    },
    type: [{
      type: String,
      enum: Object.values(AiAssistantType),
      required: true,
    }],
    pages: [{
      type: Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    }],
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
