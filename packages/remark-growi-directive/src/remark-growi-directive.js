/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('unified').Processor<Root>} Processor
 */

import {
  directiveFromMarkdown,
  directiveToMarkdown,
} from './mdast-util-growi-directive/index.js';
import { directive } from './micromark-extension-growi-directive/index.js';

/**
 * Plugin to support GROWI plugin (`$lsx(/path, depth=2)`).
 *
 * Add support for generic directives.
 *
 * ###### Notes
 *
 * Doesn’t handle the directives: create your own plugin to do that.
 *
 * @returns {undefined}
 *   Nothing.
 */
export function remarkGrowiDirectivePlugin() {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(directive());
  fromMarkdownExtensions.push(directiveFromMarkdown());
  toMarkdownExtensions.push(directiveToMarkdown());
}
