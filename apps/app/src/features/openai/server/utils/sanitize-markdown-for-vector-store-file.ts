export const sanitizeMarkdownForVectorStoreFile = (markdown: string): string => {
  let replacedMarkdown = markdown;

  // Sanitize drawio content
  // https://regex101.com/r/ieo5Z2/1
  replacedMarkdown = replacedMarkdown.replace(/``` drawio\n([\s\S]*?)\n```/g, '');

  return replacedMarkdown;
};
