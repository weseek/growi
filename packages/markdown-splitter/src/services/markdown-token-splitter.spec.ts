import type { TiktokenModel } from 'js-tiktoken';
import { encodingForModel } from 'js-tiktoken';

import { splitMarkdownIntoChunks } from './markdown-token-splitter';

const MODEL: TiktokenModel = 'gpt-4';
const encoder = encodingForModel(MODEL);

describe('splitMarkdownIntoChunks', () => {
  const repeatedText = 'This is a repeated sentence for testing purposes. '.repeat(100);
  const markdown = `---
title: Test Document
author: John Doe
---

${repeatedText}

# Header 1

This is the first paragraph under header 1. It contains some text to simulate a longer paragraph for testing.
This paragraph is extended with more content to ensure proper chunking behavior.${repeatedText}

## Header 1-1

This is the first paragraph under header 1-1. The text is a bit longer to ensure proper chunking. More text follows.


### Header 1-1-1

This is the first paragraph under header 1-1-1. The content is nested deeper,
making sure that the chunking algorithm works properly with multiple levels of headers.

This is another paragraph under header 1-1-1, continuing the content at this deeper level.

#### Header 1-1-1-1

Now we have reached the fourth level of headers. The text here should also be properly chunked and grouped with its parent headers.

This is another paragraph under header 1-1-1-1. It should be grouped with the correct higher-level headers.

# Header 2

Here is some content under header 2. This section should also be sufficiently long to ensure that the token count threshold is reached in the test.

## Header 2-1

${repeatedText}

${repeatedText}

Another sub-header under header 2 with text for testing chunking behavior. This is a fairly lengthy paragraph as well.

We now have a fourth-level sub-header under header 2-1. This ensures that the chunking logic can handle deeply nested content.

### Header 2-1-1

Here is another paragraph under header 2-1-1. This paragraph is part of a more deeply nested section.

# Header 3

Continuing with more headers and content to make sure the markdown document is sufficiently large. This is a new header with more paragraphs under it.

### Header 3-1

This is a sub-header under header 3. The content here continues to grow, ensuring that the markdown is long enough to trigger multiple chunks.

#### Header 3-1-1

Here is a fourth-level sub-header under header 3-1. This paragraph is designed to create a larger markdown file for testing purposes.
`;
  test('Each chunk should not exceed the specified token count', async() => {
    const maxToken = 800;
    const result = await splitMarkdownIntoChunks(markdown, MODEL, maxToken);

    result.forEach((chunk) => {
      const tokenCount = encoder.encode(chunk).length;
      expect(tokenCount).toBeLessThanOrEqual(maxToken * 1.1);
    });
  });
  test('Each chunk should include the relevant top-level header', async() => {
    const result = await splitMarkdownIntoChunks(markdown, MODEL, 800);

    result.forEach((chunk) => {
      const containsHeader1 = chunk.includes('# Header 1');
      const containsHeader2 = chunk.includes('# Header 2');
      const containsHeader3 = chunk.includes('# Header 3');
      const doesNotContainHash = !chunk.includes('# ');

      expect(containsHeader1 || containsHeader2 || containsHeader3 || doesNotContainHash).toBe(true);
    });
  });
  test('Should throw an error if a header exceeds half of maxToken size with correct error message', async() => {
    const maxToken = 800;
    const markdownWithLongHeader = `
# Short Header 1

This is the first paragraph under short header 1. It contains some text for testing purposes.

## ${repeatedText}

This is the first paragraph under the long header. It contains text to ensure that the header length check is triggered if the header is too long.

# Short Header 2

Another section with a shorter header, but enough content to ensure proper chunking.
`;

    try {
      await splitMarkdownIntoChunks(markdownWithLongHeader, MODEL, maxToken);
    }
    catch (error) {
      if (error instanceof Error) {
        expect(error.message).toContain('Heading token count is too large');
      }
      else {
        throw new Error('An unknown error occurred');
      }
    }
  });

  test('Should return the entire markdown as a single chunk if token count is less than or equal to maxToken', async() => {
    const markdownText = `
    # Header 1
    This is a short paragraph under header 1. It contains only a few sentences to ensure that the total token count remains under the maxToken limit.
    `;

    const maxToken = 800;

    const result = await splitMarkdownIntoChunks(markdownText, MODEL, maxToken);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(markdownText);
  });
});
