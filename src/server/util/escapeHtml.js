const escapeHtml = (html) => {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

module.exports = escapeHtml;
