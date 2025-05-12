import type OpenAI from 'openai';

import { configManager } from '~/server/service/config-manager';

import { AssistantType } from './assistant-types';
import { getOrCreateAssistant } from './create-assistant';
import { instructionsForFileSearch, instructionsForInjectionCountermeasures } from './instructions/commons';

let editorAssistant: OpenAI.Beta.Assistant | undefined;

export const getOrCreateEditorAssistant = async(): Promise<OpenAI.Beta.Assistant> => {
  if (editorAssistant != null) {
    return editorAssistant;
  }

  editorAssistant = await getOrCreateAssistant({
    type: AssistantType.EDIT,
    model: configManager.getConfig('openai:assistantModel:edit'),
    /* eslint-disable max-len */
    instructions: `# Your Role
You are an Editor Assistant for GROWI, a markdown wiki system.
Your task is to help users edit their markdown content based on their requests.
---

${instructionsForInjectionCountermeasures}
---

${instructionsForFileSearch}
`,
    /* eslint-enable max-len */
  });

  return editorAssistant;
};
