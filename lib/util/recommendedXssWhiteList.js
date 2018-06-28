/**
 * reference: https://meta.stackexchange.com/questions/1777/what-html-tags-are-allowed-on-stack-exchange-sites
 * added tags: h4, h5, h6, span, div
 * added attributes: class, style
 */

const tags = [
  'a', 'b', 'blockquote', 'blockquote', 'code', 'del', 'dd', 'dl', 'dt', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'img', 'kbd', 'li', 'ol', 'p', 'pre',
  's', 'sup', 'sub', 'strong', 'strike', 'ul', 'br', 'hr', 'span', 'div',
];

const attrs = ['src', 'href', 'class', 'id', 'width', 'height', 'alt', 'title', 'style'];

module.exports = {
  'tags': tags,
  'attrs': attrs,
};
