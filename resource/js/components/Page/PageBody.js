import React from 'react';
import marked from 'marked';
import hljs from 'highlight.js';

export default class PageBody extends React.Component {

  constructor(props) {
    super(props);

    this.getMarkupHTML = this.getMarkupHTML.bind(this);
  }

  getMarkupHTML() {
    let body = this.props.pageBody;
    if (body === '') {
      body = this.props.page.revision.body;
    }

    let parsed = '<b>...</b>';
    try {
      // TODO
      marked.setOptions({
        gfm: true,
        highlight: function (code, lang) {
          let result, hl;
          if (lang) {
            try {
              hl = hljs.highlight(lang, code);
              result = hl.value;
            } catch (e) {
              result = code;
            }
          } else {
            result = code;
          }
          return result;
        },
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        langPrefix: 'lang-'
      });
      parsed = marked(body);
    } catch (e) { console.log(e, e.stack); }

    return { __html: parsed };
  }

  render() {
    const parsedBody = this.getMarkupHTML();

    return (
      <div
        className="content"
        dangerouslySetInnerHTML={parsedBody}
        />
    );
  }
}

PageBody.propTypes = {
  page: React.PropTypes.object.isRequired,
  pageBody: React.PropTypes.string,
};

PageBody.defaultProps = {
  page: {},
  pageBody: '',
};

