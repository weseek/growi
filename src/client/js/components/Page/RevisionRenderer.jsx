import React from 'react';
import PropTypes from 'prop-types';

import RevisionBody from './RevisionBody';

export default class RevisionRenderer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
    };

    this.renderHtml = this.renderHtml.bind(this);
    this.getHighlightedBody = this.getHighlightedBody.bind(this);

    this.setMarkdown(this.props.markdown);
  }

  componentWillReceiveProps(nextProps) {
    this.renderHtml(nextProps.markdown, this.props.highlightKeywords);
  }

  setMarkdown(markdown) {
    this.renderHtml(markdown, this.props.highlightKeywords);
  }

  /**
   * transplanted from legacy code -- Yuki Takei
   * @param {string} body html strings
   * @param {string} keywords
   */
  getHighlightedBody(body, keywords) {
    let returnBody = body;

    keywords.replace(/"/g, '').split(' ').forEach((keyword) => {
      if (keyword === '') {
        return;
      }
      const k = keyword
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
      const keywordExp = new RegExp(`(${k}(?!(.*?")))`, 'ig');
      returnBody = returnBody.replace(keywordExp, '<em class="highlighted">$&</em>');
    });

    return returnBody;
  }

  renderHtml(markdown, highlightKeywords) {
    const context = {
      markdown,
      currentPagePath: this.props.pagePath,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRender', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        context.parsedHTML = crowiRenderer.process(context.markdown);
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = crowiRenderer.postProcess(context.parsedHTML);

        // highlight
        if (highlightKeywords != null) {
          context.parsedHTML = this.getHighlightedBody(context.parsedHTML, highlightKeywords);
        }
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderHtml', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderHtml', context) });

  }

  render() {
    const config = this.props.crowi.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;

    return (
      <RevisionBody
        html={this.state.html}
        isMathJaxEnabled={isMathJaxEnabled}
        renderMathJaxOnInit
      />
    );
  }

}

RevisionRenderer.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  markdown: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  highlightKeywords: PropTypes.string,
};
