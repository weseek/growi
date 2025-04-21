import type OpenAI from 'openai';

import { configManager } from '~/server/service/config-manager';

import { openaiClient } from '../client';

const AssistantType = {
  SEARCH: 'Search',
  CHAT: 'Chat',
} as const;

const AssistantDefaultModelMap: Record<AssistantType, OpenAI.Chat.ChatModel> = {
  [AssistantType.SEARCH]: 'gpt-4o-mini',
  [AssistantType.CHAT]: 'gpt-4o-mini',
};

const isValidChatModel = (model: string): model is OpenAI.Chat.ChatModel => {
  return model.startsWith('gpt-');
};

const getAssistantModelByType = (type: AssistantType): OpenAI.Chat.ChatModel => {
  const configValue =
    type === AssistantType.SEARCH
      ? undefined // TODO: add the value for 'openai:assistantModel:search' to config-definition.ts
      : configManager.getConfig('openai:assistantModel:chat');

  if (typeof configValue === 'string' && isValidChatModel(configValue)) {
    return configValue;
  }

  return AssistantDefaultModelMap[type];
};

type AssistantType = (typeof AssistantType)[keyof typeof AssistantType];

const findAssistantByName = async (assistantName: string): Promise<OpenAI.Beta.Assistant | undefined> => {
  // declare finder
  const findAssistant = async (assistants: OpenAI.Beta.Assistants.AssistantsPage): Promise<OpenAI.Beta.Assistant | undefined> => {
    const found = assistants.data.find((assistant) => assistant.name === assistantName);

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

const getOrCreateAssistant = async (type: AssistantType, nameSuffix?: string): Promise<OpenAI.Beta.Assistant> => {
  const appSiteUrl = configManager.getConfig('app:siteUrl');
  const assistantName = `GROWI ${type} Assistant for ${appSiteUrl}${nameSuffix != null ? ` ${nameSuffix}` : ''}`;
  const assistantModel = getAssistantModelByType(type);

  const assistant =
    (await findAssistantByName(assistantName)) ??
    (await openaiClient.beta.assistants.create({
      name: assistantName,
      model: assistantModel,
    }));

  // update instructions
  const instructions = configManager.getConfig('openai:chatAssistantInstructions');
  openaiClient.beta.assistants.update(assistant.id, {
    instructions,
    model: assistantModel,
    tools: [{ type: 'file_search' }],
  });

  return assistant;
};

// let searchAssistant: OpenAI.Beta.Assistant | undefined;
// export const getOrCreateSearchAssistant = async(): Promise<OpenAI.Beta.Assistant> => {
//   if (searchAssistant != null) {
//     return searchAssistant;
//   }

//   searchAssistant = await getOrCreateAssistant(AssistantType.SEARCH);
//   openaiClient.beta.assistants.update(searchAssistant.id, {
//     instructions: configManager.getConfig('openai:searchAssistantInstructions'),
//     tools: [{ type: 'file_search' }],
//   });

//   return searchAssistant;
// };

let chatAssistant: OpenAI.Beta.Assistant | undefined;
export const getOrCreateChatAssistant = async (): Promise<OpenAI.Beta.Assistant> => {
  if (chatAssistant != null) {
    return chatAssistant;
  }

  chatAssistant = await getOrCreateAssistant(AssistantType.CHAT);
  return chatAssistant;
};
