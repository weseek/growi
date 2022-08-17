/**
 * @typedef {import('mdast').Root} Root
 *
 * @typedef {import('mdast-util-directive')} DoNotTouchAsThisImportIncludesDirectivesInTree
 */

import { directiveFromMarkdown, directiveToMarkdown } from './mdast-util-growi-plugin/index.js';
import { directive } from './micromark-extension-growi-plugin/index.js';

/**
    * Plugin to support GROWI plugin (`$lsx(/path, depth=2)`).
    *
    * @type {import('unified').Plugin<void[], Root>}
    */
export function remarkGrowiPlugin() {
  const data = this.data();

  add('micromarkExtensions', directive());
  add('fromMarkdownExtensions', directiveFromMarkdown);
  add('toMarkdownExtensions', directiveToMarkdown);

  /**
      * @param {string} field
      * @param {unknown} value
      */
  function add(field, value) {
    const list = /** @type {unknown[]} */ (
      // Other extensions
      /* c8 ignore next 2 */
      data[field] ? data[field] : (data[field] = [])
    );

    list.push(value);
  }
}
