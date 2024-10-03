import { splitMarkdownIntoChunks } from '../src/services/markdown-splitter';

describe('splitMarkdownIntoChunks', () => {

  it('should split markdown into sections using the specified chunk size', async() => {
    const markdown = `
# Heading 1
This is some content under heading 1.

# Heading 2
This is some content under heading 2.

# Heading 3
This is some content under heading 3.

# Heading 4
This is some content under heading 4.
`;
    const chunkSize = 60;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Expect the result to have more than one section due to chunkSize limitations
    expect(result.length).toBeGreaterThan(1);
    for (const section of result) {
      expect(section.pageContent.length).toBeLessThanOrEqual(chunkSize);
    }
  });

  it('should handle markdown without headers', async() => {
    const markdown = `
This is some content without any headers. It should not be split unless it exceeds the chunk size.
`;
    const chunkSize = 100;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Since the content is short, expect no splits
    expect(result.length).toBe(1);
    expect(result[0].pageContent.length).toBeLessThanOrEqual(chunkSize);
  });

  it('should split large content under a single heading', async() => {
    const markdown = `
# Large Heading
${'This is some repetitive content. '.repeat(50)}
`;
    const chunkSize = 100;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    expect(result.length).toBeGreaterThan(1);
    for (const section of result) {
      expect(section.pageContent.length).toBeLessThanOrEqual(chunkSize);
    }
  });

  it('should handle empty markdown input', async() => {
    const markdown = '';
    const chunkSize = 10;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Expect an empty result for empty markdown input
    expect(result.length).toBe(0);
  });

  it('should correctly split nested headings', async() => {
    const markdown = `
# Heading 1
Content under heading 1.

## Subheading 1.1
Content under subheading 1.1.

# Heading 2
Content under heading 2.
`;
    const chunkSize = 50;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Expect multiple sections
    expect(result.length).toBeGreaterThan(1);
    for (const section of result) {
      expect(section.pageContent.length).toBeLessThanOrEqual(chunkSize);
    }
  });

  it('should not split if content fits within chunk size', async() => {
    const markdown = `
# Heading
Short content.
`;
    const chunkSize = 100;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Expect the result to be a single section since the content is small
    expect(result.length).toBe(1);
    expect(result[0].pageContent.length).toBeLessThanOrEqual(chunkSize);
  });

  it('should handle multiple consecutive headers', async() => {
    const markdown = `
# Heading 1

# Heading 2

# Heading 3

# Heading 4
`;
    const chunkSize = 50;
    const result = await splitMarkdownIntoChunks(markdown, chunkSize);

    // Expect each heading to be treated as a separate section
    expect(result.length).toBeGreaterThan(1);
    for (const section of result) {
      expect(section.pageContent.length).toBeLessThanOrEqual(chunkSize);
    }
  });
});
