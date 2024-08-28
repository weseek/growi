import type OpenAI from 'openai';

import { configManager } from '../../config-manager';
import { openaiClient } from '../client';

const findAssistantByName = async(assistantName: string): Promise<OpenAI.Beta.Assistant | undefined> => {

  // declare finder
  const findAssistant = async(assistants: OpenAI.Beta.Assistants.AssistantsPage): Promise<OpenAI.Beta.Assistant | undefined> => {
    const found = assistants.data.find(assistant => assistant.name === assistantName);

    if (found != null) {
      return found;
    }

    // recursively find assistant
    if (assistants.hasNextPage()) {
      return findAssistant(await assistants.getNextPage());
    }
  };

  const storedAssistants = await openaiClient.beta.assistants.list({ order: 'desc' });

  return findAssistant(storedAssistants);
};

const getOrCreateAssistant = async(): Promise<OpenAI.Beta.Assistant> => {

  const appSiteUrl = configManager.getConfig('crowi', 'app:siteUrl');
  const assistantName = `GROWI OpenAI Assistant for ${appSiteUrl}`;

  const assistantOnRemote = await findAssistantByName(assistantName);
  if (assistantOnRemote != null) {
    // store
    return assistantOnRemote;
  }

  const newAssistant = await openaiClient.beta.assistants.create({
    name: assistantName,
    model: 'gpt-4o',
  });

  return newAssistant;
};

export const defaultAssistant = getOrCreateAssistant();
