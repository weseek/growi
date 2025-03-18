import createError from 'http-errors';

import AiAssistantModel, { type AiAssistantDocument } from '../models/ai-assistant';


export const setDefaultAiAssistant = async(id: string, isDefault: boolean): Promise<AiAssistantDocument> => {
  const aiAssistant = await AiAssistantModel.findById(id);
  if (aiAssistant == null) {
    throw createError(404, 'AiAssistant document does not exist');
  }

  await AiAssistantModel.updateMany({ isDefault: true }, { isDefault: false });

  aiAssistant.isDefault = isDefault;
  const updatedAiAssistant = await aiAssistant.save();

  return updatedAiAssistant;
};
