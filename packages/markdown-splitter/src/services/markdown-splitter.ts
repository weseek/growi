export type Chunk = {
  label: string;
  content: string;
}

/**
 * Adds a new chunk to the chunks array if content is not empty.
 * Trims trailing whitespace and newlines to avoid unnecessary line breaks.
 * @param chunks - The array to store chunks
 * @param content - The content of the chunk
 * @param label - The label of the chunk
 */
function createChunk(chunks: Chunk[], content: string, label: string) {
  const trimmedContent = content.trimEnd();
  if (trimmedContent !== '') {
    chunks.push({ label, content: trimmedContent });
  }
}

/**
 * Updates the section label based on the heading depth.
 * Allows non-consecutive heading levels by initializing missing levels with 1.
 * @param sectionCounters - The current section counters
 * @param depth - The depth of the heading (e.g., # is depth 1, ## is depth 2)
 * @returns The updated section label
 */
function updateSectionLabel(sectionCounters: number[], depth: number): string {
  if (depth > sectionCounters.length) {
    // If depth increases by more than one, initialize missing levels with 1
    while (sectionCounters.length < depth) {
      sectionCounters.push(1);
    }
  }
  else if (depth === sectionCounters.length) {
    // If the same level, increment the last counter
    sectionCounters[depth - 1]++;
  }
  else {
    // If depth decreases, remove deeper levels and increment the current level
    sectionCounters.splice(depth);
    sectionCounters[depth - 1]++;
  }
  return sectionCounters.join('-');
}

/**
 * Splits Markdown text into labeled chunks, considering content that may start before any headers
 * and handling non-consecutive heading levels. Reduces unnecessary line breaks while preserving
 * list indentation and leading spaces. Ensures that no empty line is added between sections.
 * @param markdown - The input Markdown string
 * @returns An array of chunks
 */
export function splitMarkdownIntoChunks(markdown: string): Chunk[] {
  const chunks: Chunk[] = [];
  const sectionCounters: number[] = [];

  if (!markdown || typeof markdown !== 'string' || markdown.trim() === '') {
    return chunks;
  }

  const lines = markdown.split('\n');
  let currentContent: string[] = [];
  let currentSectionLabel = '';
  let previousLineEmpty = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('#')) {
      if (currentContent.length > 0) {
        if (currentSectionLabel !== '') {
          const contentLabel = `${currentSectionLabel}-content`;
          createChunk(chunks, currentContent.join('\n'), contentLabel);
        }
        else {
          createChunk(chunks, currentContent.join('\n'), '0-content');
        }
        currentContent = [];
      }

      const headerMatch = trimmedLine.match(/^(#+)\s+(.*)/);
      if (headerMatch) {
        const headerDepth = headerMatch[1].length;
        currentSectionLabel = updateSectionLabel(sectionCounters, headerDepth);
        createChunk(chunks, line, currentSectionLabel);
      }
    }
    else if (trimmedLine === '') {
      if (!previousLineEmpty && currentContent.length > 0) {
        currentContent.push('');
        previousLineEmpty = true;
      }
    }
    else {
      currentContent.push(line);
      previousLineEmpty = false;
    }
  });

  if (currentContent.length > 0) {
    if (currentSectionLabel !== '') {
      const contentLabel = `${currentSectionLabel}-content`;
      createChunk(chunks, currentContent.join('\n'), contentLabel);
    }
    else {
      createChunk(chunks, currentContent.join('\n'), '0-content');
    }
  }

  return chunks;
}
