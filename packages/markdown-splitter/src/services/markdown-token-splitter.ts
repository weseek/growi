import { encodingForModel, type TiktokenModel } from 'js-tiktoken';

import { splitMarkdownIntoFragments, type MarkdownFragment } from './markdown-splitter';

type MarkdownFragmentGroups = MarkdownFragment[][] ;

function groupMarkdownFragments(
    markdownFragments: MarkdownFragment[],
    maxToken: number,
): MarkdownFragmentGroups {
  const labels = markdownFragments.map(fragment => fragment.label);

  // Get a list of unique prefixes
  const uniquePrefixes: string[] = [...new Set(labels.map((label) => {
    if (label === 'frontmatter') {
      return 'frontmatter';
    }
    const match = label.match(/^\d+(-\d+)*/); // Match the prefix part
    return match ? match[0] : ''; // Ensure a string is returned
  }).filter((prefix): prefix is string => prefix !== ''))]; // Type narrowing to string


  // Group chunks by prefix
  const fragmentGroupes: MarkdownFragmentGroups = [];
  let remainingPrefixes = [...uniquePrefixes];

  // Process chunks so that the total token count per level doesn't exceed maxToken
  while (remainingPrefixes.length > 0) {
    const prefix = remainingPrefixes[0]; // Get the first prefix
    const hasNextLevelPrefix = uniquePrefixes.some(p => p !== prefix && p.startsWith(prefix));

    if (!hasNextLevelPrefix) {
      // If there is no prefix that starts with the current prefix, group the chunks directly
      let matchingFragments = markdownFragments.filter(fragment => fragment.label === prefix);

      // Add parent heading if it exists
      const parts = prefix.split('-');
      for (let i = 1; i < parts.length; i++) {
        const parentPrefix = parts.slice(0, i).join('-');
        const parentHeading = markdownFragments.find(fragment => fragment.label === `${parentPrefix}-heading`);
        if (parentHeading) {
          matchingFragments = [parentHeading, ...matchingFragments]; // Add the heading at the front
        }
      }

      fragmentGroupes.push(matchingFragments);
    }
    else {
      // Filter chunks that start with the current prefix
      let matchingFragments = markdownFragments.filter(fragment => fragment.label.startsWith(prefix));

      // Add parent heading if it exists
      const parts = prefix.split('-');
      for (let i = 1; i < parts.length; i++) {
        const parentPrefix = parts.slice(0, i).join('-');
        const parentHeading = markdownFragments.find(fragment => fragment.label === `${parentPrefix}-heading`);
        if (parentHeading) {
          matchingFragments = [parentHeading, ...matchingFragments];
        }
      }

      // Calculate total token count including parent headings
      const totalTokenCount = matchingFragments.reduce((sum, fragment) => sum + fragment.tokenCount, 0);

      // If the total token count doesn't exceed maxToken, group the chunks
      if (totalTokenCount <= maxToken) {
        fragmentGroupes.push(matchingFragments);
        remainingPrefixes = remainingPrefixes.filter(p => !p.startsWith(`${prefix}-`));
      }
      else {
        // If it exceeds maxToken, strictly filter chunks by the exact numeric prefix
        const strictMatchingFragments = markdownFragments.filter((fragment) => {
          const match = fragment.label.match(/^\d+(-\d+)*(?=-)/);
          return match && match[0] === prefix;
        });

        // Add parent heading if it exists
        for (let i = 1; i < parts.length; i++) {
          const parentPrefix = parts.slice(0, i).join('-');
          const parentHeading = markdownFragments.find(fragment => fragment.label === `${parentPrefix}-heading`);
          if (parentHeading) {
            strictMatchingFragments.unshift(parentHeading); // Add the heading at the front
          }
        }

        fragmentGroupes.push(strictMatchingFragments);
      }
    }
    remainingPrefixes.shift();
  }

  return fragmentGroupes;
}

// Function to group markdown into chunks based on token count
export async function splitMarkdownIntoChunks(
    markdownText: string,
    model: TiktokenModel,
    maxToken = 800,
): Promise<string[]> {
  const encoder = encodingForModel(model);

  // If the total token count for the entire markdown text is less than or equal to maxToken,
  // return the entire markdown as a single chunk.
  if (encoder.encode(markdownText).length <= maxToken) {
    return [markdownText];
  }

  // Split markdown text into chunks
  const markdownFragments = await splitMarkdownIntoFragments(markdownText, model);
  const chunks = [] as string[];

  // Group the chunks based on token count
  const fragmentGroupes = groupMarkdownFragments(markdownFragments, maxToken);

  fragmentGroupes.forEach((fragmentGroupe) => {
    // Calculate the total token count for each group
    const totalTokenCount = fragmentGroupe.reduce((sum, fragment) => sum + fragment.tokenCount, 0);

    // If the total token count doesn't exceed maxToken, combine the chunks into one
    if (totalTokenCount <= maxToken) {
      const chunk = fragmentGroupe.map((fragment, index) => {
        const nextFragment = fragmentGroupe[index + 1];
        if (nextFragment) {
          // If both the current and next chunks are headings, add a single newline
          if (fragment.type === 'heading' && nextFragment.type === 'heading') {
            return `${fragment.text}\n`;
          }
          // Add two newlines for other cases
          return `${fragment.text}\n\n`;
        }
        return fragment.text; // No newlines for the last chunk
      }).join('');

      chunks.push(chunk);
    }
    else {
      // If the total token count exceeds maxToken, split content
      const headingFragments = fragmentGroupe.filter(fragment => fragment.type === 'heading'); // Find all headings
      const headingText = headingFragments.map(heading => heading.text).join('\n'); // Combine headings with one newline

      for (const fragment of fragmentGroupe) {
        if (fragment.label.includes('content')) {
          // Combine heading and paragraph content
          const combinedTokenCount = headingFragments.reduce((sum, heading) => sum + heading.tokenCount, 0) + fragment.tokenCount;
          // Check if headingChunks alone exceed maxToken
          const headingTokenCount = headingFragments.reduce((sum, heading) => sum + heading.tokenCount, 0);

          if (headingTokenCount > maxToken / 2) {
            throw new Error(
              `Heading token count is too large. Heading token count: ${headingTokenCount}, allowed maximum: ${Math.ceil(maxToken / 2)}`,
            );
          }

          // If the combined token count exceeds maxToken, split the content by character count
          if (combinedTokenCount > maxToken) {
            const headingTokenCount = headingFragments.reduce((sum, heading) => sum + heading.tokenCount, 0);
            const remainingTokenCount = maxToken - headingTokenCount;

            // Calculate the total character count and token count
            const fragmentCharCount = fragment.text.length;
            const fragmenTokenCount = fragment.tokenCount;

            // Calculate the character count for splitting
            const charCountForSplit = Math.floor((remainingTokenCount / fragmenTokenCount) * fragmentCharCount);

            // Split content based on character count
            const splitContents = [];
            for (let i = 0; i < fragment.text.length; i += charCountForSplit) {
              splitContents.push(fragment.text.slice(i, i + charCountForSplit));
            }

            // Add each split content to the new group of chunks
            splitContents.forEach((splitText) => {
              const chunk = headingText
                ? `${headingText}\n\n${splitText}`
                : `${splitText}`;
              chunks.push(chunk);
            });
          }
          else {
            const chunk = headingText
              ? `${headingText}\n\n${fragment.text}`
              : `${fragment.text}`;
            chunks.push(chunk);
          }
        }
      }
    }
  });

  return chunks;
}
