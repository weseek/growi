import { encodingForModel } from 'js-tiktoken';
import test from 'tape';

import { splitMarkdownByTokens } from '../src/services/markdown-token-splitter';

const modelName = 'gpt-3.5-turbo'; // Replace with the appropriate model name if needed

test('should split markdown into sections under the max token limit', (t) => {
  const markdown = `
# Heading 1
Content under heading 1.

# Heading 2
Content under heading 2.

## Subheading 2.1
Content under subheading 2.1.

# Heading 3
Content under heading 3.
  `;
  const maxTokens = 50;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.ok(sections.length > 1, 'Sections should be more than one');
  sections.forEach((section) => {
    const tokens = encodingForModel(modelName).encode(section);
    t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');
  });

  t.end();
});

test('should handle markdown without headings', (t) => {
  const markdown = 'This is a markdown without any headings. It should be returned as a single section unless it exceeds the max token limit.';
  const maxTokens = 100;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.equal(sections.length, 1, 'Sections should be exactly one');
  const tokens = encodingForModel(modelName).encode(sections[0]);
  t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');

  t.end();
});

test('should split large content under a single heading', (t) => {
  const markdown = `
# Large Heading
${'Long content. '.repeat(500)}
  `;
  const maxTokens = 100;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.ok(sections.length > 1, 'Sections should be more than one');
  sections.forEach((section) => {
    const tokens = encodingForModel(modelName).encode(section);
    t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');
  });

  t.end();
});

test('should handle empty markdown input', (t) => {
  const markdown = '';
  const maxTokens = 50;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.equal(sections.length, 0, 'Sections should be zero');

  t.end();
});

test('should handle markdown where a single node exceeds maxTokens', (t) => {
  const markdown = `
# Heading with Large Content
${'Very long content. '.repeat(1000)}
  `;
  const maxTokens = 10;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.ok(sections.length > 1, 'Sections should be more than one');
  sections.forEach((section) => {
    const tokens = encodingForModel(modelName).encode(section);
    t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');
  });

  t.end();
});

test('should correctly split nested headings', (t) => {
  const markdown = `
# Heading 1
Content under heading 1.

## Subheading 1.1
Content under subheading 1.1.

### Sub-subheading 1.1.1
Content under sub-subheading 1.1.1.

# Heading 2
Content under heading 2.
  `;
  const maxTokens = 30;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.ok(sections.length > 1, 'Sections should be more than one');
  sections.forEach((section) => {
    const tokens = encodingForModel(modelName).encode(section);
    t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');
  });

  t.end();
});

test('should not split sections unnecessarily', (t) => {
  const markdown = `
# Short Heading
Short content.
  `;
  const maxTokens = 100;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.equal(sections.length, 1, 'Sections should be exactly one');
  const tokens = encodingForModel(modelName).encode(sections[0]);
  t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');

  t.end();
});

test('should handle multiple consecutive headings', (t) => {
  const markdown = `
# Heading 1

# Heading 2

# Heading 3

# Heading 4
  `;
  const maxTokens = 10;

  const sections = splitMarkdownByTokens(markdown, maxTokens, modelName);

  t.equal(sections.length, 4, 'Sections should be four');
  sections.forEach((section) => {
    const tokens = encodingForModel(modelName).encode(section);
    t.ok(tokens.length <= maxTokens, 'Section tokens should be less than or equal to maxTokens');
  });

  t.end();
});
