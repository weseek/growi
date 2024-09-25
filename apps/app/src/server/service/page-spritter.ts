import type { Tiktoken, TiktokenModel } from '@dqbd/tiktoken';
import { encoding_for_model } from '@dqbd/tiktoken'; // eslint-disable-line
import type { Root, Content, Heading } from 'mdast';
// import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

/**
 * Interface representing a section
 */
interface Section {
  heading: Heading | null;
  content: Content[];
}

/**
 * Function to recursively split Markdown content by header sections so that each section has a token count below the specified maximum
 *
 * @param model - The name of the model to use (e.g., 'gpt-4')
 * @param markdownContent - The Markdown content to split
 * @param maxTokens - The maximum number of tokens per section (default: 100)
 * @returns An array of split Markdown sections
 */
export async function splitMarkdownByTokens(
    model: TiktokenModel,
    markdownContent: string,
    maxTokens = 100,
): Promise<string[]> {
  // Obtain encoding based on the model
  const encoding: Tiktoken = encoding_for_model(model);
  const remarkParse = (await import('remark-parse')).default;
  // Parse Markdown into AST
  const processor = unified().use(remarkParse);
  const tree = processor.parse(markdownContent) as Root;

  /**
   * Function to stringify a node
   * @param node - The node to stringify
   * @returns The Markdown string of the node
   */
  const stringify = (node: Root): string => {
    return unified().use(remarkStringify).stringify(node);
  };

  /**
   * Function to get the token count of a text
   * @param text - The text to calculate token count for
   * @returns The number of tokens
   */
  const getTokenCount = (text: string): number => {
    return encoding.encode(text).length;
  };

  /**
   * Function to split nodes into sections based on headers
   * @param nodes - The array of nodes to split
   * @returns An array of sections
   */
  const splitSections = (nodes: Content[]): Section[] => {
    const sections: Section[] = [];
    let currentSection: Section = { heading: null, content: [] };

    for (const node of nodes) {
      if (node.type === 'heading') {
        // Start a new section
        if (currentSection.heading || currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { heading: node as Heading, content: [] };
      }
      else {
        currentSection.content.push(node);
      }
    }

    // Add the last section
    if (currentSection.heading || currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  /**
   * Function to recursively process sections
   * @param sections - The array of sections to process
   * @returns An array of split Markdown strings
   */
  const processSections = (sections: Section[]): string[] => {
    const results: string[] = [];

    for (const section of sections) {
      const nodes: Content[] = [];
      if (section.heading) {
        nodes.push(section.heading);
      }
      nodes.push(...section.content);

      const subtree: Root = { type: 'root', children: nodes };
      const content = stringify(subtree);
      const tokenCount = getTokenCount(content);

      if (tokenCount <= maxTokens) {
        results.push(content);
      }
      else if (section.content.some(child => child.type === 'heading')) {
        // Split into subsections
        const subsections = splitSections(section.content);
        results.push(...processSections(subsections));
      }
      else {
        // Split by paragraphs
        const paragraphs = splitByParagraphs(nodes);
        results.push(...paragraphs);
      }
    }

    return results;
  };

  /**
   * Function to split nodes by paragraphs
   * @param nodes - The array of nodes to split
   * @returns An array of split Markdown strings
   */
  const splitByParagraphs = (nodes: Content[]): string[] => {
    const results: string[] = [];
    let currentNodes: Content[] = [];
    let currentTokenCount = 0;

    for (const node of nodes) {
      const nodeContent = stringify({ type: 'root', children: [node] });
      const nodeTokenCount = getTokenCount(nodeContent);

      if (currentTokenCount + nodeTokenCount <= maxTokens) {
        currentNodes.push(node);
        currentTokenCount += nodeTokenCount;
      }
      else {
        if (currentNodes.length > 0) {
          const chunk = stringify({ type: 'root', children: currentNodes });
          results.push(chunk);
          currentNodes = [];
          currentTokenCount = 0;
        }
        if (nodeTokenCount > maxTokens) {
          // If a single node exceeds maxTokens, add it as is
          results.push(nodeContent);
        }
        else {
          currentNodes.push(node);
          currentTokenCount = nodeTokenCount;
        }
      }
    }

    if (currentNodes.length > 0) {
      const chunk = stringify({ type: 'root', children: currentNodes });
      results.push(chunk);
    }

    return results;
  };

  // Get initial sections
  const initialSections = splitSections(tree.children);
  // Process sections
  const result = processSections(initialSections);

  // Free the encoding
  encoding.free();

  return result;
}
