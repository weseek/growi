import type { TiktokenModel } from '@dqbd/tiktoken';

import { splitMarkdownByTokens } from '../../../src/server/service/page-spritter';

describe('splitMarkdownByTokens', () => {
  const model: TiktokenModel = 'gpt-3.5-turbo';

  test('Returns without splitting when token count is below the maximum', () => {
    const markdownContent = '# Heading\n\nThis is a test.';
    const result = splitMarkdownByTokens(model, markdownContent, 1000);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(markdownContent);
  });

  test('Splits by sections when token count exceeds the maximum', () => {
    const markdownContent = `
# Heading1

This is the content of section 1.

# Heading2

This is the content of section 2.

# Heading3

This is the content of section 3.
    `;
    const result = splitMarkdownByTokens(model, markdownContent, 10); // Set a small maxTokens
    expect(result).toHaveLength(3);
    expect(result[0]).toContain('Heading1');
    expect(result[1]).toContain('Heading2');
    expect(result[2]).toContain('Heading3');
  });

  test('Recursively splits into subsections', () => {
    const markdownContent = `
# Heading1

## Subheading1-1

Content1-1

## Subheading1-2

Content1-2

# Heading2

Content2
    `;
    const result = splitMarkdownByTokens(model, markdownContent, 20);
    expect(result.length).toBeGreaterThan(2);
    expect(result.some(chunk => chunk.includes('Subheading1-1'))).toBe(true);
    expect(result.some(chunk => chunk.includes('Subheading1-2'))).toBe(true);
  });

  test('Splits by paragraphs', () => {
    const markdownContent = `
# Heading

${'Long paragraph. '.repeat(50)}
    `;
    const result = splitMarkdownByTokens(model, markdownContent, 50);
    expect(result.length).toBeGreaterThan(1);
  });

  test('Adds a single node as is when it exceeds maxTokens', () => {
    const markdownContent = `
# Heading

${'Very long paragraph. '.repeat(200)}
    `;
    const result = splitMarkdownByTokens(model, markdownContent, 50);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Very long paragraph.');
  });
});
