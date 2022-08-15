import { RemarkGrowiPluginType } from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/ls|lsx/);
const SUPPORTED_ATTRIBUTES = ['prefix', 'num', 'depth', 'sort', 'reverse', 'filter'];


type DirectiveAttributes = Record<string, string>


export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === RemarkGrowiPluginType.Text || node.type === RemarkGrowiPluginType.Leaf) {
        if (typeof node.name !== 'string') {
          return;
        }
        if (!NODE_NAME_PATTERN.test(node.name)) {
          return;
        }

        const data = node.data ?? (node.data = {});
        const attributes = node.attributes as DirectiveAttributes || {};

        // set 'prefix' attribute if the first attribute is only value
        // e.g.
        //   case 1: lsx(prefix=/path..., ...)    => prefix="/path"
        //   case 2: lsx(/path, ...)              => prefix="/path"
        //   case 3: lsx(/foo, prefix=/bar ...)   => prefix="/bar"
        if (attributes.prefix == null) {
          const attrEntries = Object.entries(attributes);

          if (attrEntries.length > 0) {
            const [firstAttrKey, firstAttrValue] = attrEntries[0];

            if (firstAttrValue === '' && !SUPPORTED_ATTRIBUTES.includes(firstAttrValue)) {
              attributes.prefix = firstAttrKey;
            }
          }
        }

        data.hName = 'lsx';
        data.hProperties = attributes;
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['lsx'],
  attributes: {
    lsx: SUPPORTED_ATTRIBUTES,
  },
};
