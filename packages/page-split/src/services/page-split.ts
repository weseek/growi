import type { TiktokenModel } from 'js-tiktoken';
import { encodingForModel } from 'js-tiktoken';
import type { Root, Content } from 'mdast';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export function splitMarkdownByTokens(
    markdownString: string,
    maxTokens: number,
    modelName: TiktokenModel,
): string[] {
  // Parse the markdown into an AST
  const tree = unified().use(remarkParse).parse(markdownString) as Root;
  const encoding = encodingForModel(modelName);

  function countTokens(text: string): number {
    const tokens = encoding.encode(text);
    return tokens.length;
  }

  // Recursively split sections
  function splitSectionRecursively(nodes: Content[]): Content[][] {
    const sections: Content[][] = [];
    let currentSection: Content[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      currentSection.push(node);

      const markdown = unified()
        .use(remarkStringify)
        .stringify({ type: 'root', children: currentSection });
      const tokenCount = countTokens(markdown);

      if (tokenCount > maxTokens) {
        // If the token count exceeds the limit, treat the nodes up to the previous one as a section
        currentSection.pop();
        if (currentSection.length > 0) {
          sections.push([...currentSection]);
        }
        // Start a new section from the current node
        currentSection = [node];

        // If a single node exceeds maxTokens, add it as its own section
        const singleNodeMarkdown = unified()
          .use(remarkStringify)
          .stringify({ type: 'root', children: [node] });
        const singleNodeTokenCount = countTokens(singleNodeMarkdown);
        if (singleNodeTokenCount > maxTokens) {
          sections.push([node]);
          currentSection = [];
        }
      }

      // If it's the last node, add the section
      if (i === nodes.length - 1 && currentSection.length > 0) {
        sections.push([...currentSection]);
      }
    }

    // Recursively split each section
    const recursivelySplitSections: Content[][] = [];
    for (const section of sections) {
      // If the section contains child headings, split further
      const hasHeading = section.some(node => node.type === 'heading');
      if (hasHeading && countTokens(unified().use(remarkStringify).stringify({ type: 'root', children: section })) > maxTokens) {
        // Recursively split child nodes
        const childSections = splitSectionRecursively(section);
        recursivelySplitSections.push(...childSections);
      }
      else {
        recursivelySplitSections.push(section);
      }
    }

    return recursivelySplitSections;
  }

  // Recursively split the AST's child nodes
  const splitSections = splitSectionRecursively(tree.children);

  // Convert the split sections back into markdown strings
  const markdownSections = splitSections.map(sectionNodes => unified()
    .use(remarkStringify)
    .stringify({ type: 'root', children: sectionNodes }));

  return markdownSections;
}
