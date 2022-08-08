import { fromMarkdown, toMarkdown } from 'mdast-util-wiki-link';
import { syntax } from 'micromark-extension-wiki-link';
import { Plugin } from 'unified';


function add(data: Record<string, unknown>, key: string, value) {
  if (data[key] != null) {
    const array = data[key];
    if (Array.isArray(array)) {
      array.push(value);
    }
  }
  else {
    data[key] = [value];
  }
}


type PukiwikiLikeLinkerParams = {};

export const pukiwikiLinkLinker: Plugin<[PukiwikiLikeLinkerParams]> = function(options = {}) {
  const data = this.data();

  add(data, 'micromarkExtensions', syntax({}));
  add(data, 'fromMarkdownExtensions', fromMarkdown({}));
  add(data, 'toMarkdownExtensions', toMarkdown({}));
};

// wikiLinkPlugin.wikiLinkPlugin = wikiLinkPlugin;
// export default wikiLinkPlugin;
