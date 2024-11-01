import { defaultSchema } from 'hast-util-sanitize';
import deepmerge from 'ts-deepmerge';

type Attributes = typeof defaultSchema.attributes;

/**
 * reference: https://meta.stackexchange.com/questions/1777/what-html-tags-are-allowed-on-stack-exchange-sites,
 *            https://github.com/jch/html-pipeline/blob/70b6903b025c668ff3c02a6fa382031661182147/lib/html/pipeline/sanitization_filter.rb#L41
 */

export const tagNames: Array<string> = [
  ...defaultSchema.tagNames ?? [],
  '-', 'bdi',
  'button',
  'col', 'colgroup',
  'data',
  'iframe',
  'video',
  'rb', 'u',
];

export const attributes: Attributes = deepmerge(
  defaultSchema.attributes ?? {},
  {
    iframe: ['allow', 'referrerpolicy', 'sandbox', 'src', 'srcdoc'],
    video: ['controls', 'src', 'muted', 'preload', 'width', 'height', 'autoplay'],
    // The special value 'data*' as a property name can be used to allow all data properties.
    // see: https://github.com/syntax-tree/hast-util-sanitize/
    '*': ['key', 'class', 'className', 'style', 'data*'],
  },
);
