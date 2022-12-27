/**
 * reference: https://meta.stackexchange.com/questions/1777/what-html-tags-are-allowed-on-stack-exchange-sites,
 *            https://github.com/jch/html-pipeline/blob/70b6903b025c668ff3c02a6fa382031661182147/lib/html/pipeline/sanitization_filter.rb#L41
 */

const tags = [
  '-', 'a', 'abbr', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'caption', 'cite',
  'code', 'col', 'colgroup', 'data', 'dd', 'del', 'details', 'dfn', 'div', 'dl',
  'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7',
  'h8', 'hr', 'i', 'iframe', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p',
  'pre', 'q', 'rb', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'span', 'strike',
  'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'time', 'tr', 'tt', 'u', 'ul', 'var', 'wbr',
];

const attrs = ['src', 'href', 'class', 'id', 'width', 'height', 'alt', 'title', 'style'];

module.exports = {
  tags,
  attrs,
};
