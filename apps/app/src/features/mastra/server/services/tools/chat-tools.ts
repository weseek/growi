import { openai } from '@ai-sdk/openai';
import { createTool } from '@mastra/core/tools';
import { generateText } from 'ai';
import { z } from 'zod';

export const chatTool = createTool({
  id: 'file-search',
  description: 'Search for files in the project',
  inputSchema: z.object({
    prompt: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),

  execute: async({ context: { prompt } }) => {
    const response = await generateText({
      model: openai('gpt-4o'),
      prompt,
      tools: {
        file_search: openai.tools.fileSearch({
          // optional configuration:
          vectorStoreIds: ['vs_68b65ccb682c81918368df3c0093e5ec'],
          maxNumResults: 10,
          ranking: {
            ranker: 'auto',
          },
        }),
      },

      providerOptions: {
        openai: {
          store: true,
        },
      },
      // Force file search tool:
      toolChoice: { type: 'tool', toolName: 'file_search' },
    });
    return {
      output: response.text,
    };
  },
});
