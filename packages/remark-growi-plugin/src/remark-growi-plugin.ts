import { Plugin } from 'unified';

import { directiveFromMarkdown, directiveToMarkdown } from './mdast-util-growi-plugin';
import { directive } from './micromark-extension-growi-plugin/dev';

export const remarkGrowiPlugin: Plugin = function() {
  const data = this.data();

  function add(field: string, value) {
    if (data[field] != null) {
      const array = data[field];
      if (Array.isArray(array)) {
        array.push(value);
      }
    }
    else {
      data[field] = [value];
    }
  }

  add('micromarkExtensions', directive());
  add('fromMarkdownExtensions', directiveFromMarkdown);
  add('toMarkdownExtensions', directiveToMarkdown);
};
