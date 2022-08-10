/**
 * @typedef {import('mdast').Root} Root
 *
 * @typedef {import('mdast-util-directive')} DoNotTouchAsThisImportIncludesDirectivesInTree
 */

import { directiveFromMarkdown, directiveToMarkdown } from './mdast-util-growi-plugin';
import { directive } from './micromark-extension-growi-plugin/dev';

/**
  * Plugin to support GROWI plugin (`$lsx(/path, depth=2)`).
  *
  * @type {import('unified').Plugin<void[], Root>}
  */
export default function remarkGrowiPlugin() {
  const data = this.data();

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

  add('micromarkExtensions', directive());
  add('fromMarkdownExtensions', directiveFromMarkdown);
  add('toMarkdownExtensions', directiveToMarkdown);
}
