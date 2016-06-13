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


    //var contentHtml = Crowi.unescape(contentText);
    //// TODO 前処理系のプラグイン化
    //contentHtml = this.preFormatMarkdown(contentHtml);
    //contentHtml = this.expandImage(contentHtml);
    //contentHtml = this.link(contentHtml);

    //var $body = this.$revisionBody;
    // Using async version of marked
    //{}, function (err, content) {
    //  if (err) {
    //    throw err;
    //  }
    //  $body.html(content);
    //});
    //return body;
    try {
    marked.setOptions({
      gfm: true,
      highlight: (code, lang, callback) => {
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
        return callback(null, result);
      },
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      langPrefix: 'lang-'
    });
    console.log('parsing', 'いくぜ');
    const parsed = marked(body);
    console.log('parsed', parsed);
    } catch (e) { console.log(e); }

    return { __html: parsed };
  }

  render() {
    console.log('Render!');

    return (
      <div
        className="content"
        dangerouslySetInnerHTML={this.getMarkupHTML()}
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

