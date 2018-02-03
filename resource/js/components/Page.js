import React from 'react';
import PropTypes from 'prop-types';

import RevisionBody from './Page/RevisionBody';

export default class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};

    this.appendEditSectionButtons = this.appendEditSectionButtons.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    // this.getHighlightBody = this.getHighlightBody.bind(this);
  }

  componentWillMount() {
    this.renderHtml(this.props.markdown);
  }
  // getHighlightBody(body, keywords) {
  //   let returnBody = body;

  //   keywords.replace(/"/g, '').split(' ').forEach((keyword) => {
  //     if (keyword === '') {
  //       return;
  //     }
  //     const k = keyword
  //           .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  //           .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
  //     const keywordExp = new RegExp(`(${k}(?!(.*?")))`, 'ig');
  //     returnBody = returnBody.replace(keywordExp, '<em class="highlighted">$&</em>');
  //   });

  //   return returnBody;
  // }

  componentDidUpdate() {
    this.appendEditSectionButtons();
  }

  /**
   * Add edit section buttons to headers
   * This invoke `appendEditSectionButtons` method of `legacy/crowi.js`
   */
  appendEditSectionButtons(parentElement) {
    if (this.props.showHeadEditButton) {
      const crowiForJquery = this.props.crowi.getCrowiForJquery();
      crowiForJquery.appendEditSectionButtons(this.previewElement);
    }
  }

  renderHtml(markdown) {
    var context = {
      markdown,
      dom: this.previewElement,
      currentPagePath: this.props.pagePath,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRenderPreview', context)
      .then(() => interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.preProcess(context.markdown);
      })
      .then(() => interceptorManager.process('postPreProcess', context))
      .then(() => {
        var parsedHTML = crowiRenderer.process(context.markdown);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => interceptorManager.process('prePostProcess', context))
      .then(() => {
        context.markdown = crowiRenderer.postProcess(context.parsedHTML, context.dom);
      })
      .then(() => interceptorManager.process('postPostProcess', context))
      .then(() => interceptorManager.process('preRenderPreviewHtml', context))
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postRenderPreviewHtml', context));

  }

  render() {
    const config = this.props.crowi.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;

    return (
      <RevisionBody html={this.state.html}
          inputRef={el => this.previewElement = el}
          isMathJaxEnabled={isMathJaxEnabled}
          renderMathJaxOnInit={true}
      />
    )
  }
}

Page.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  markdown: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  showHeadEditButton: PropTypes.bool,
  highlightKeywords: PropTypes.string,
};
