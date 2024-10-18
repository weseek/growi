import { encodingForModel, type TiktokenModel } from 'js-tiktoken';

import type { MarkdownFragment } from '~/index';
import { splitMarkdownIntoChunks, splitMarkdownIntoFragments } from '~/index';

const MODEL: TiktokenModel = 'gpt-4';
const encoder = encodingForModel(MODEL);

describe('splitMarkdownIntoFragments', () => {

  test('handles empty markdown string', async() => {
    const markdown = '';
    const expected: MarkdownFragment[] = [];
    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown with only content and no headers', async() => {
    const markdown = `This is some content without any headers.
It spans multiple lines.

Another paragraph.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '0-content-1',
        type: 'paragraph',
        text: 'This is some content without any headers.\nIt spans multiple lines.',
        tokenCount: encoder.encode('This is some content without any headers.\nIt spans multiple lines.').length,
      },
      {
        label: '0-content-2',
        type: 'paragraph',
        text: 'Another paragraph.',
        tokenCount: encoder.encode('Another paragraph.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown starting with a header', async() => {
    const markdown = `
# Header 1
Content under header 1.

## Header 1.1
Content under header 1.1.

# Header 2
Content under header 2.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
      {
        label: '1-1-heading',
        type: 'heading',
        text: '## Header 1.1',
        tokenCount: encoder.encode('## Header 1.1').length,
      },
      {
        label: '1-1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.1.',
        tokenCount: encoder.encode('Content under header 1.1.').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Header 2',
        tokenCount: encoder.encode('# Header 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content under header 2.',
        tokenCount: encoder.encode('Content under header 2.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown with non-consecutive heading levels', async() => {
    const markdown = `
Introduction without a header.

# Chapter 1
Content of chapter 1.

### Section 1.1.1
Content of section 1.1.1.

## Section 1.2
Content of section 1.2.

# Chapter 2
Content of chapter 2.

## Section 2.1
Content of section 2.1.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '0-content-1',
        type: 'paragraph',
        text: 'Introduction without a header.',
        tokenCount: encoder.encode('Introduction without a header.').length,
      },
      {
        label: '1-heading',
        type: 'heading',
        text: '# Chapter 1',
        tokenCount: encoder.encode('# Chapter 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content of chapter 1.',
        tokenCount: encoder.encode('Content of chapter 1.').length,
      },
      {
        label: '1-1-1-heading',
        type: 'heading',
        text: '### Section 1.1.1',
        tokenCount: encoder.encode('### Section 1.1.1').length,
      },
      {
        label: '1-1-1-content-1',
        type: 'paragraph',
        text: 'Content of section 1.1.1.',
        tokenCount: encoder.encode('Content of section 1.1.1.').length,
      },
      {
        label: '1-2-heading',
        type: 'heading',
        text: '## Section 1.2',
        tokenCount: encoder.encode('## Section 1.2').length,
      },
      {
        label: '1-2-content-1',
        type: 'paragraph',
        text: 'Content of section 1.2.',
        tokenCount: encoder.encode('Content of section 1.2.').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Chapter 2',
        tokenCount: encoder.encode('# Chapter 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content of chapter 2.',
        tokenCount: encoder.encode('Content of chapter 2.').length,
      },
      {
        label: '2-1-heading',
        type: 'heading',
        text: '## Section 2.1',
        tokenCount: encoder.encode('## Section 2.1').length,
      },
      {
        label: '2-1-content-1',
        type: 'paragraph',
        text: 'Content of section 2.1.',
        tokenCount: encoder.encode('Content of section 2.1.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown with skipped heading levels', async() => {
    const markdown = `
# Header 1
Content under header 1.

#### Header 1.1.1.1
Content under header 1.1.1.1.

## Header 1.2
Content under header 1.2.

# Header 2
Content under header 2.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
      {
        label: '1-1-1-1-heading',
        type: 'heading',
        text: '#### Header 1.1.1.1',
        tokenCount: encoder.encode('#### Header 1.1.1.1').length,
      },
      {
        label: '1-1-1-1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.1.1.1.',
        tokenCount: encoder.encode('Content under header 1.1.1.1.').length,
      },
      {
        label: '1-2-heading',
        type: 'heading',
        text: '## Header 1.2',
        tokenCount: encoder.encode('## Header 1.2').length,
      },
      {
        label: '1-2-content-1',
        type: 'paragraph',
        text: 'Content under header 1.2.',
        tokenCount: encoder.encode('Content under header 1.2.').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Header 2',
        tokenCount: encoder.encode('# Header 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content under header 2.',
        tokenCount: encoder.encode('Content under header 2.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles malformed headings', async() => {
    const markdown = `
# Header 1
Content under header 1.

#### Header 1.1.1.1
Content under header 1.1.1.1.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
      {
        label: '1-1-1-1-heading',
        type: 'heading',
        text: '#### Header 1.1.1.1',
        tokenCount: encoder.encode('#### Header 1.1.1.1').length,
      },
      {
        label: '1-1-1-1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.1.1.1.',
        tokenCount: encoder.encode('Content under header 1.1.1.1.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles multiple content blocks before any headers', async() => {
    const markdown = `
This is the first paragraph without a header.

This is the second paragraph without a header.

# Header 1
Content under header 1.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '0-content-1',
        type: 'paragraph',
        text: 'This is the first paragraph without a header.',
        tokenCount: encoder.encode('This is the first paragraph without a header.').length,
      },
      {
        label: '0-content-2',
        type: 'paragraph',
        text: 'This is the second paragraph without a header.',
        tokenCount: encoder.encode('This is the second paragraph without a header.').length,
      },
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown with only headers and no content', async() => {
    const markdown = `
# Header 1

## Header 1.1

### Header 1.1.1
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-1-heading',
        type: 'heading',
        text: '## Header 1.1',
        tokenCount: encoder.encode('## Header 1.1').length,
      },
      {
        label: '1-1-1-heading',
        type: 'heading',
        text: '### Header 1.1.1',
        tokenCount: encoder.encode('### Header 1.1.1').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('handles markdown with mixed content and headers', async() => {
    const markdown = `
# Header 1
Content under header 1.

## Header 1.1
Content under header 1.1.
Another piece of content.

# Header 2
Content under header 2.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
      {
        label: '1-1-heading',
        type: 'heading',
        text: '## Header 1.1',
        tokenCount: encoder.encode('## Header 1.1').length,
      },
      {
        label: '1-1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.1.\nAnother piece of content.',
        tokenCount: encoder.encode('Content under header 1.1.\nAnother piece of content.').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Header 2',
        tokenCount: encoder.encode('# Header 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content under header 2.',
        tokenCount: encoder.encode('Content under header 2.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('preserves list indentation and reduces unnecessary line breaks', async() => {
    const markdown = `
# Header 1
Content under header 1.

- Item 1
  - Subitem 1
- Item 2


# Header 2
Content under header 2.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Content under header 1.',
        tokenCount: encoder.encode('Content under header 1.').length,
      },
      {
        label: '1-content-2',
        type: 'list',
        text: '- Item 1\n  - Subitem 1\n- Item 2',
        tokenCount: encoder.encode('- Item 1\n  - Subitem 1\n- Item 2').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Header 2',
        tokenCount: encoder.encode('# Header 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content under header 2.',
        tokenCount: encoder.encode('Content under header 2.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('code blocks containing # are not treated as headings', async() => {
    const markdown = `
# Header 1
Some introductory content.
\`\`\`
# This is a comment with a # symbol
Some code line
\`\`\`
Additional content.
# Header 2
Content under header 2.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Some introductory content.',
        tokenCount: encoder.encode('Some introductory content.').length,
      },
      {
        label: '1-content-2',
        type: 'code',
        text: '```\n# This is a comment with a # symbol\nSome code line\n```',
        tokenCount: encoder.encode('```\n# This is a comment with a # symbol\nSome code line\n```').length,
      },
      {
        label: '1-content-3',
        type: 'paragraph',
        text: 'Additional content.',
        tokenCount: encoder.encode('Additional content.').length,
      },
      {
        label: '2-heading',
        type: 'heading',
        text: '# Header 2',
        tokenCount: encoder.encode('# Header 2').length,
      },
      {
        label: '2-content-1',
        type: 'paragraph',
        text: 'Content under header 2.',
        tokenCount: encoder.encode('Content under header 2.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });

  test('frontmatter is processed and labeled correctly', async() => {
    const markdown = `---
title: Test Document
author: John Doe
---

# Header 1
Some introductory content.
    `;

    const expected: MarkdownFragment[] = [
      {
        label: 'frontmatter',
        type: 'yaml',
        text: JSON.stringify({ title: 'Test Document', author: 'John Doe' }, null, 2),
        tokenCount: encoder.encode(JSON.stringify({ title: 'Test Document', author: 'John Doe' }, null, 2)).length,
      },
      {
        label: '1-heading',
        type: 'heading',
        text: '# Header 1',
        tokenCount: encoder.encode('# Header 1').length,
      },
      {
        label: '1-content-1',
        type: 'paragraph',
        text: 'Some introductory content.',
        tokenCount: encoder.encode('Some introductory content.').length,
      },
    ];

    const result = await splitMarkdownIntoFragments(markdown, MODEL);
    expect(result).toEqual(expected);
  });
});

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

${repeatedText}

### Header 2-1

Another sub-header under header 2 with text for testing chunking behavior. This is a fairly lengthy paragraph as well.

We now have a fourth-level sub-header under header 2-1. This ensures that the chunking logic can handle deeply nested content.

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

  test('Should return the entire markdown as a single chunk if token count is less than or equal to maxToken', async() => {
    const markdownWithContentBeforeHeading = `
This is a short paragraph

# Header 1
${repeatedText}
    `;

    const maxToken = 800;

    const result = await splitMarkdownIntoChunks(markdownWithContentBeforeHeading, MODEL, maxToken);
    result.forEach((chunk) => {
      const tokenCount = encoder.encode(chunk).length;
      expect(tokenCount).toBeLessThanOrEqual(maxToken * 1.1);
    });
  });
});
