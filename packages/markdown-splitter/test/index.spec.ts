import type { Chunk } from '../src/services/markdown-splitter';
import { splitMarkdownIntoChunks } from '../src/services/markdown-splitter';

describe('splitMarkdownIntoChunks', () => {

  test('handles empty markdown string', async() => {
    const markdown = '';
    const expected: Chunk[] = [];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
    expect(result).toEqual(expected);
  });

  test('handles markdown with only content and no headers', async() => {
    const markdown = `This is some content without any headers.
It spans multiple lines.

Another paragraph.
    `;
    const expected: Chunk[] = [
      {
        label: '0-content',
        text: 'This is some content without any headers.\nIt spans multiple lines.\n\nAnother paragraph.',
      },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.' },
      { label: '1-1-heading', text: '## Header 1.1' },
      { label: '1-1-content', text: 'Content under header 1.1.' },
      { label: '2-heading', text: '# Header 2' },
      { label: '2-content', text: 'Content under header 2.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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
    const expected: Chunk[] = [
      {
        label: '0-content',
        text: 'Introduction without a header.',
      },
      {
        label: '1-heading',
        text: '# Chapter 1',
      },
      {
        label: '1-content',
        text: 'Content of chapter 1.',
      },
      {
        label: '1-1-1-heading',
        text: '### Section 1.1.1',
      },
      {
        label: '1-1-1-content',
        text: 'Content of section 1.1.1.',
      },
      {
        label: '1-2-heading',
        text: '## Section 1.2',
      },
      {
        label: '1-2-content',
        text: 'Content of section 1.2.',
      },
      {
        label: '2-heading',
        text: '# Chapter 2',
      },
      {
        label: '2-content',
        text: 'Content of chapter 2.',
      },
      {
        label: '2-1-heading',
        text: '## Section 2.1',
      },
      {
        label: '2-1-content',
        text: 'Content of section 2.1.',
      },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.' },
      { label: '1-1-1-1-heading', text: '#### Header 1.1.1.1' },
      { label: '1-1-1-1-content', text: 'Content under header 1.1.1.1.' },
      { label: '1-2-heading', text: '## Header 1.2' },
      { label: '1-2-content', text: 'Content under header 1.2.' },
      { label: '2-heading', text: '# Header 2' },
      { label: '2-content', text: 'Content under header 2.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
    expect(result).toEqual(expected);
  });

  test('handles malformed headings', async() => {
    const markdown = `
# Header 1
Content under header 1.

#### Header 1.1.1.1
Content under header 1.1.1.1.
    `;
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.' },
      { label: '1-1-1-1-heading', text: '#### Header 1.1.1.1' },
      { label: '1-1-1-1-content', text: 'Content under header 1.1.1.1.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
    expect(result).toEqual(expected);
  });

  test('handles multiple content blocks before any headers', async() => {
    const markdown = `
This is the first paragraph without a header.

This is the second paragraph without a header.

# Header 1
Content under header 1.
    `;
    const expected: Chunk[] = [
      {
        label: '0-content',
        text: 'This is the first paragraph without a header.\n\nThis is the second paragraph without a header.',
      },
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
    expect(result).toEqual(expected);
  });

  test('handles markdown with only headers and no content', async() => {
    const markdown = `
# Header 1

## Header 1.1

### Header 1.1.1
    `;
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-1-heading', text: '## Header 1.1' },
      { label: '1-1-1-heading', text: '### Header 1.1.1' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.' },
      { label: '1-1-heading', text: '## Header 1.1' },
      { label: '1-1-content', text: 'Content under header 1.1.\nAnother piece of content.' },
      { label: '2-heading', text: '# Header 2' },
      { label: '2-content', text: 'Content under header 2.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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
    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Content under header 1.\n\n- Item 1\n  - Subitem 1\n- Item 2' },
      { label: '2-heading', text: '# Header 2' },
      { label: '2-content', text: 'Content under header 2.' },
    ];
    const result = await splitMarkdownIntoChunks(markdown); // Await the result
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

    const expected: Chunk[] = [
      { label: '1-heading', text: '# Header 1' },
      { label: '1-content', text: 'Some introductory content.\n\n```\n# This is a comment with a # symbol\nSome code line\n```\n\nAdditional content.' },
      { label: '2-heading', text: '# Header 2' },
      { label: '2-content', text: 'Content under header 2.' },
    ];

    const result = await splitMarkdownIntoChunks(markdown);
    expect(result).toEqual(expected);
  });
});
