import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

import { chatTool } from '../tools/chat-tools';

export const chatAgent = new Agent({
  name: 'GROWI RAG Agent',
  instructions: `
      You are a helpful assistant for GROWI, a knowledge base software.
      Your primary function is to answer questions based on the content of GROWI pages.

      When responding:
      - Use the provided 'chat' tool to search for relevant information within GROWI.
      - Synthesize the search results to provide a comprehensive answer.
      - If the search results do not contain enough information to answer the question, state that you could not find the information in GROWI.
      - Keep responses concise but informative.
`,
  model: openai('gpt-4o-mini'),
  tools: {
    chat: chatTool,
  },
});
