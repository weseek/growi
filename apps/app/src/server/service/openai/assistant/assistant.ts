import type OpenAI from 'openai';

import { configManager } from '../../config-manager';
import { openaiClient } from '../client';


const AssistantType = {
  SEARCH: 'Search',
  CHAT: 'Chat',
} as const;

type AssistantType = typeof AssistantType[keyof typeof AssistantType];


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

const getOrCreateAssistant = async(type: AssistantType): Promise<OpenAI.Beta.Assistant> => {
  const appSiteUrl = configManager.getConfig('crowi', 'app:siteUrl');
  const assistantName = `GROWI ${type} Assistant for ${appSiteUrl} ${process.env.OPENAI_ASSISTANT_NAME_SUFFIX}`;

  const assistantOnRemote = await findAssistantByName(assistantName);
  if (assistantOnRemote != null) {
    return assistantOnRemote;
  }

  const newAssistant = await openaiClient.beta.assistants.create({
    name: assistantName,
    model: 'gpt-4o',
  });

  return newAssistant;
};

let searchAssistant: OpenAI.Beta.Assistant | undefined;
export const getOrCreateSearchAssistant = async(): Promise<OpenAI.Beta.Assistant> => {
  if (searchAssistant != null) {
    return searchAssistant;
  }

  searchAssistant = await getOrCreateAssistant(AssistantType.SEARCH);
  openaiClient.beta.assistants.update(searchAssistant.id, {
    instructions: process.env.OPENAI_SEARCH_ASSISTANT_INSTRUCTIONS,
  });

  return searchAssistant;
};


let chatAssistant: OpenAI.Beta.Assistant | undefined;
export const getOrCreateChatAssistant = async(): Promise<OpenAI.Beta.Assistant> => {
  if (chatAssistant != null) {
    return chatAssistant;
  }

  chatAssistant = await getOrCreateAssistant(AssistantType.CHAT);
  openaiClient.beta.assistants.update(chatAssistant.id, {
    instructions: process.env.OPENAI_CHAT_ASSISTANT_INSTRUCTIONS,
  });

  return chatAssistant;
};
