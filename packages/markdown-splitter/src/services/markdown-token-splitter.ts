import type { TiktokenModel } from 'js-tiktoken';

import { splitMarkdownIntoChunks, type Chunk } from './markdown-splitter';

type GroupedChunks = { [prefix: string]: Chunk[] };

function assembleMarkdownRecursively(
    chunks: Chunk[],
    maxToken: number,
): GroupedChunks {
  const labels = chunks.map(chunk => chunk.label);

  // Get a list of unique prefixes
  const uniquePrefixes: string[] = [...new Set(labels.map((label) => {
    if (label === 'frontmatter') {
      return 'frontmatter';
    }
    const match = label.match(/^\d+(-\d+)*/); // Match the prefix part
    return match ? match[0] : ''; // Ensure a string is returned
  }).filter((prefix): prefix is string => prefix !== ''))]; // Type narrowing to string


  // Group chunks by prefix
  const groupedChunks: GroupedChunks = {};
  let remainingPrefixes = [...uniquePrefixes];

  // Process chunks so that the total token count per level doesn't exceed maxToken
  while (remainingPrefixes.length > 0) {
    const prefix = remainingPrefixes[0]; // Get the first prefix
    const hasNextLevelPrefix = uniquePrefixes.some(p => p.startsWith(prefix));

    if (!hasNextLevelPrefix) {
      // If there is no prefix that starts with the current prefix, group the chunks directly
      let strictMatchingChunks = chunks.filter(chunk => chunk.label === prefix);

      // Add parent heading if it exists
      const parts = prefix.split('-');
      for (let i = 1; i < parts.length; i++) {
        const parentPrefix = parts.slice(0, i).join('-');
        const parentHeading = chunks.find(chunk => chunk.label === `${parentPrefix}-heading`);
        if (parentHeading) {
          strictMatchingChunks = [parentHeading, ...strictMatchingChunks]; // Add the heading at the front
        }
      }

      groupedChunks[prefix] = strictMatchingChunks;
    }
    else {
      // Filter chunks that start with the current prefix
      let matchingChunks = chunks.filter(chunk => chunk.label.startsWith(prefix));

      // Add parent heading if it exists
      const parts = prefix.split('-');
      for (let i = 1; i < parts.length; i++) {
        const parentPrefix = parts.slice(0, i).join('-');
        const parentHeading = chunks.find(chunk => chunk.label === `${parentPrefix}-heading`);
        if (parentHeading) {
          matchingChunks = [parentHeading, ...matchingChunks];
        }
      }

      // Calculate total token count including parent headings
      const totalTokenCount = matchingChunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

      // If the total token count doesn't exceed maxToken, group the chunks
      if (totalTokenCount <= maxToken) {
        groupedChunks[prefix] = matchingChunks;
        remainingPrefixes = remainingPrefixes.filter(p => !p.startsWith(`${prefix}-`));
      }
      else {
        // If it exceeds maxToken, strictly filter chunks by the exact numeric prefix
        const strictMatchingChunks = chunks.filter((chunk) => {
          const match = chunk.label.match(/^\d+(-\d+)*(?=-)/);
          return match && match[0] === prefix;
        });

        // Add parent heading if it exists
        for (let i = 1; i < parts.length; i++) {
          const parentPrefix = parts.slice(0, i).join('-');
          const parentHeading = chunks.find(chunk => chunk.label === `${parentPrefix}-heading`);
          if (parentHeading) {
            strictMatchingChunks.unshift(parentHeading); // Add the heading at the front
          }
        }

        groupedChunks[prefix] = strictMatchingChunks;
      }
    }
    remainingPrefixes.shift();
  }

  return groupedChunks;
}

// Function to group markdown into chunks based on token count
export async function assembleMarkdownIntoChunk(
    markdownText: string,
    model = 'gpt-4' as TiktokenModel,
    maxToken = 800,
): Promise<GroupedChunks> {
  // Split markdown text into chunks
  const chunks = await splitMarkdownIntoChunks(markdownText, model);

  // Group the chunks based on token count
  const groupedChunks = assembleMarkdownRecursively(chunks, maxToken);

  for (const prefix of Object.keys(groupedChunks)) {
    const chunks = groupedChunks[prefix];

    // Calculate the total token count for each group
    const totalTokenCount = chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);

    // If the total token count doesn't exceed maxToken, combine the chunks into one
    if (totalTokenCount <= maxToken) {
      const combinedContent = chunks.map((chunk, index) => {
        const nextChunk = chunks[index + 1];
        if (nextChunk) {
          // If both the current and next chunks are headings, add a single newline
          if (chunk.type === 'heading' && nextChunk.type === 'heading') {
            return `${chunk.text}\n`;
          }
          // Add two newlines for other cases
          return `${chunk.text}\n\n`;
        }
        return chunk.text; // No newlines for the last chunk
      }).join('');

      // Combine into one chunk while maintaining the token count
      groupedChunks[prefix] = [{
        label: prefix,
        text: combinedContent,
        tokenCount: totalTokenCount,
      }];
    }
    else {
      // If the total token count exceeds maxToken, split content
      const headingChunks = chunks.filter(chunk => chunk.type === 'heading'); // Find all headings
      const headingText = headingChunks.map(heading => heading.text).join('\n'); // Combine headings with one newline

      const newGroupedChunks = []; // Create a new group of chunks

      for (const chunk of chunks) {
        if (chunk.label.includes('content')) {
          // Combine heading and paragraph content
          const combinedText = `${headingText}\n\n${chunk.text}`;
          const combinedTokenCount = headingChunks.reduce((sum, heading) => sum + heading.tokenCount, 0) + chunk.tokenCount;
          // Check if headingChunks alone exceed maxToken
          const headingTokenCount = headingChunks.reduce((sum, heading) => sum + heading.tokenCount, 0);
          if (headingTokenCount > maxToken) {
            console.error(`Heading token count exceeds maxToken. Heading token count: ${headingTokenCount}, maxToken: ${maxToken}`);
            break; // Exit the loop
          }

          // If the combined token count exceeds maxToken, split the content by character count
          if (combinedTokenCount > maxToken) {
            const headingTokenCount = headingChunks.reduce((sum, heading) => sum + heading.tokenCount, 0);
            const remainingTokenCount = maxToken - headingTokenCount;

            // Calculate the total character count and token count
            const totalCharCount = chunk.text.length;
            const totalTokenCount = chunk.tokenCount;

            // Calculate the character count for splitting
            const charCountForSplit = Math.floor((remainingTokenCount / totalTokenCount) * totalCharCount);

            // Split content based on character count
            const splitContents = [];
            for (let i = 0; i < chunk.text.length; i += charCountForSplit) {
              splitContents.push(chunk.text.slice(i, i + charCountForSplit));
            }

            // Add each split content to the new group of chunks
            splitContents.forEach((splitText, i) => {
              newGroupedChunks.push({
                label: `${chunk.label}-split-${i + 1}`,
                text: `${headingText}\n\n${splitText}`,
                tokenCount: remainingTokenCount,
                type: 'split',
              });
            });
          }
          else {
            // If the combined token count doesn't exceed maxToken, add as-is
            newGroupedChunks.push({
              label: chunk.label,
              text: combinedText,
              tokenCount: combinedTokenCount,
              type: 'combined',
            });
          }
        }
      }

      // Update grouped chunks with the new group
      groupedChunks[prefix] = newGroupedChunks;
    }
  }

  return groupedChunks;
}
