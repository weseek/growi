import { encodingForModel, type TiktokenModel } from 'js-tiktoken';

import { splitMarkdownIntoFragments, type MarkdownFragment } from './markdown-splitter';

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
