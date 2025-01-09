import { type AiAssistant } from '../../interfaces/ai-assistant';
import AiAssistantModal, { type AiAssistantDocument } from '../models/ai-assistant';

interface IAiAssisntantService {
  createAiAssistant(data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument>;
}

class AiAssistantService implements IAiAssisntantService {

  async createAiAssistant(data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument> {
    const dumyVectorStoreId = '676e0d9863442b736e7ecf09';
    const aiAssistant = await AiAssistantModal.create({ ...data, vectorStore: dumyVectorStoreId });
    return aiAssistant;
  }

}

export const aiAssistantService = new AiAssistantService();
