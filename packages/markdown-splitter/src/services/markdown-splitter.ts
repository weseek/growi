export type Chunk = {
  label: string;
  text: string;
};

/**
 * Processes and adds a new chunk to the chunks array if content is not empty.
 * Clears the contentLines array after processing.
 * @param chunks - The array to store chunks.
 * @param contentLines - The array of content lines.
 * @param label - The label for the content chunk.
 */
function processPendingContent(chunks: Chunk[], contentLines: string[], label: string) {
  const text = contentLines.join('\n').trimEnd();
  if (text !== '') {
    chunks.push({ label, text });
  }
  contentLines.length = 0; // Clear the contentLines array
}

/**
 * Updates the section numbers based on the heading depth and returns the updated section label.
 * Handles non-consecutive heading levels by initializing missing levels with 1.
 * @param sectionNumbers - The current section numbers.
 * @param depth - The depth of the heading (e.g., # is depth 1).
 * @returns The updated section label.
 */
function updateSectionNumbers(sectionNumbers: number[], depth: number): string {
  if (depth > sectionNumbers.length) {
    // If depth increases, initialize missing levels with 1
    while (sectionNumbers.length < depth) {
      sectionNumbers.push(1);
    }
  }
  else if (depth === sectionNumbers.length) {
    // Same level, increment the last number
    sectionNumbers[depth - 1]++;
  }
  else {
    // Depth decreases, remove deeper levels and increment current level
    sectionNumbers.splice(depth);
    sectionNumbers[depth - 1]++;
  }
  return sectionNumbers.join('-');
}

/**
 * Splits Markdown text into labeled chunks, considering content that may start before any headers
 * and handling non-consecutive heading levels. Preserves list indentation and leading spaces while
 * reducing unnecessary line breaks. Ensures that no empty line is added between sections.
 * @param markdown - The input Markdown string.
 * @returns An array of labeled chunks.
 */
export function splitMarkdownIntoChunks(markdown: string): Chunk[] {
  const chunks: Chunk[] = [];
  const sectionNumbers: number[] = [];

  if (typeof markdown !== 'string' || markdown.trim() === '') {
    return chunks;
  }

  const lines = markdown.split('\n');
  const contentLines: string[] = [];
  let currentLabel = '';
  let previousLineEmpty = false;
  let inCodeBlock = false;
  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      contentLines.push(line);
      previousLineEmpty = false;
    }
    else if (inCodeBlock) {
      // Inside code block, add line to content
      contentLines.push(line);
      previousLineEmpty = false;
    }
    else if (trimmedLine.startsWith('#')) {
      // Process any pending content before starting a new section
      if (contentLines.length > 0) {
        const contentLabel = currentLabel !== '' ? `${currentLabel}-content` : '0-content';
        processPendingContent(chunks, contentLines, contentLabel);
      }

      // Match heading level and text
      const headerMatch = trimmedLine.match(/^(#+)\s+(.*)/);
      if (headerMatch) {
        const headingDepth = headerMatch[1].length;
        currentLabel = updateSectionNumbers(sectionNumbers, headingDepth);
        chunks.push({ label: `${currentLabel}-heading`, text: line });
      }
      previousLineEmpty = false;
    }
    else if (trimmedLine === '') {
      // Handle empty lines to avoid multiple consecutive empty lines
      if (!previousLineEmpty && contentLines.length > 0) {
        contentLines.push('');
        previousLineEmpty = true;
      }
    }
    else {
      // Add non-empty lines to the current content
      contentLines.push(line);
      previousLineEmpty = false;
    }
  }

  // Process any remaining content after the last line
  if (contentLines.length > 0) {
    const contentLabel = currentLabel !== '' ? `${currentLabel}-content` : '0-content';
    processPendingContent(chunks, contentLines, contentLabel);
  }

  return chunks;
}
