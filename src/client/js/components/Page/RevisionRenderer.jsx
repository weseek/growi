import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import GrowiRenderer from '../../util/GrowiRenderer';

import RevisionBody from './RevisionBody';

class RevisionRenderer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
    };

    this.renderHtml = this.renderHtml.bind(this);
    this.getHighlightedBody = this.getHighlightedBody.bind(this);
  }

  componentWillMount() {
    this.renderHtml(this.props.markdown, this.props.highlightKeywords);
  }

  componentWillReceiveProps(nextProps) {
    this.renderHtml(nextProps.markdown, this.props.highlightKeywords);
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

  renderHtml(markdown) {
    const { pageContainer } = this.props;

    const context = {
      markdown,
      currentPagePath: pageContainer.state.path,
    };

    const growiRenderer = this.props.growiRenderer;
    const interceptorManager = this.props.appContainer.interceptorManager;
    interceptorManager.process('preRender', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.process(context.markdown);
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);

        // highlight
        if (this.props.highlightKeywords != null) {
          context.parsedHTML = this.getHighlightedBody(context.parsedHTML, this.props.highlightKeywords);
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
    const config = this.props.appContainer.getConfig();
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

/**
 * Wrapper component for using unstated
 */
const RevisionRendererWrapper = (props) => {
  return createSubscribedElement(RevisionRenderer, props, [AppContainer, PageContainer]);
};

RevisionRenderer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  markdown: PropTypes.string.isRequired,
  highlightKeywords: PropTypes.string,
};

export default RevisionRendererWrapper;
