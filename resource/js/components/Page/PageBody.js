import React from 'react';
import PropTypes from 'prop-types';

export default class PageBody extends React.Component {

  constructor(props) {
    super(props);

    this.crowiRenderer = window.crowiRenderer; // FIXME
    this.getMarkupHTML = this.getMarkupHTML.bind(this);
    this.getHighlightBody = this.getHighlightBody.bind(this);
  }

  getHighlightBody(body, keywords) {
    let returnBody = body;

    keywords.replace(/"/g, '').split(' ').forEach((keyword) => {
      if (keyword === '') {
        return;
      }
      const k = keyword
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
      const keywordExp = new RegExp(`(${k}(?!(.*?")))`, 'ig');
      returnBody = returnBody.replace(keywordExp, '<em class="highlighted">$&</em>');
    });

    return returnBody;
  }

  getMarkupHTML() {
    let body = this.props.pageBody;
    if (body === '') {
      body = this.props.page.revision.body;
    }

    body = this.crowiRenderer.render(body);

    if (this.props.highlightKeywords) {
      body = this.getHighlightBody(body, this.props.highlightKeywords);
    }

    return { __html: body };
  }

  render() {
    let parsedBody = this.getMarkupHTML();

    return (
      <div
        className="content"
        dangerouslySetInnerHTML={parsedBody}
        />
    );
  }
}

PageBody.propTypes = {
  page: PropTypes.object.isRequired,
  highlightKeywords: PropTypes.string,
  pageBody: PropTypes.string,
};

PageBody.defaultProps = {
  page: {},
  pageBody: '',
};

