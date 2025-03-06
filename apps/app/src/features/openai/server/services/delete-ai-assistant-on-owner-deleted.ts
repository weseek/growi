import type { IUserHasId } from '^/../../packages/core/dist';

import loggerFactory from '~/utils/logger';

import AiAssistant from '../models/ai-assistant';

import { getOpenaiService } from './openai';

const logger = loggerFactory('growi:service:openai:delete-ai-assistant-on-owner-deleted');

export const deleteAiAssistantOnOwnerDeleted = async(user: IUserHasId): Promise<void> => {
  const openaiService = getOpenaiService();
  if (openaiService != null) {
    const aiAssistants = await AiAssistant.find({ owner: user });
    for await (const aiAssistant of aiAssistants) {
      try {
        await openaiService.deleteAiAssistant(user._id, aiAssistant._id);
      }
      catch (err) {
        logger.error(`Failed to delete AiAssistant ${aiAssistant._id}`);
      }
    }
  }

  // Cannot delete OpenAI VectorStore entities without enabling openaiService.
  // Delete OpenAI VectorStore entities through "deleteVectorStoresOrphanedFromAiAssistant" when app starts with openaiService enabled
  await AiAssistant.deleteMany({ owner: user });
};
