import AiAssistantModel from '~/features/openai/server/models/ai-assistant';
import VectorStoreRelationModel from '~/features/openai/server/models/vector-store';
import { isAiEnabled } from '~/features/openai/server/services/is-ai-enabled';
import { getOpenaiService } from '~/features/openai/server/services/openai';

export const deleteLegacyKnowledgeAssistantVectorStore = async(): Promise<void> => {
  if (!isAiEnabled()) {
    return;
  }

  const aiAssistantVectorStoreIds = await AiAssistantModel.distinct('vectorStore');
  const nonDeletedLegacyKnowledgeAssistantVectorStoreRelations = await VectorStoreRelationModel.find({
    _id: { $nin: aiAssistantVectorStoreIds },
    isDeleted: false,
  });

  const openaiService = getOpenaiService();
  for await (const vectorStoreRelation of nonDeletedLegacyKnowledgeAssistantVectorStoreRelations) {
    const vectorStoreFileRelationId = vectorStoreRelation._id;
    await openaiService?.deleteVectorStore(vectorStoreFileRelationId);
  }
};
