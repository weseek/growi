import { markdownSectionBlock } from './block-kit-builder';

export const getHelpCommandBody = (): any => {
  // adjust spacing
  let message = '*Help*\n\n';
  message += 'Usage:     `/growi [command] [args]`\n\n';
  message += 'Commands:\n\n';
  message += '`/growi create`                          Create new page\n\n';
  message += '`/growi search [keyword]`       Search pages\n\n';
  message += '`/growi keep`                      Create new page with existing slack conversations (Alpha)\n\n';

  return {
    text: 'Help',
    blocks: [
      markdownSectionBlock(message),
    ],
  };
};
