import type mongoose from 'mongoose';
import { type Model, type Document, Schema } from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

const AiAssistantType = {
  KNOWLEDGE: 'knowledge',
} as const;

type AiAssistantType = typeof AiAssistantType[keyof typeof AiAssistantType];

const AiAssistantSharingScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;

type AiAssistantSharingScope = typeof AiAssistantSharingScope[keyof typeof AiAssistantSharingScope];


const AiAssistantLearningScope = {
  PUBLIC: 'public',
  ONLY_ME: 'onlyMe',
  USER_GROUP: 'userGroup',
} as const;

type AiAssistantLearningScope = typeof AiAssistantLearningScope[keyof typeof AiAssistantLearningScope];

interface AiAssistant {
  name: string;
  description?: string
  instruction?: string
  vectorStoreId: string
  type: AiAssistantType[]
  pages: mongoose.Types.ObjectId[]
  sharingScope: AiAssistantSharingScope
  learningScope: AiAssistantLearningScope
}

interface AiAssistantDocument extends AiAssistant, Document {}

type AiAssistantModel = Model<AiAssistantDocument>


const schema = new Schema<AiAssistantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
