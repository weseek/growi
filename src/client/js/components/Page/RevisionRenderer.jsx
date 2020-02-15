import React from 'react';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import GrowiRenderer from '../../util/GrowiRenderer';

import RevisionBody from './RevisionBody';

class RevisionRenderer extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
    };

    this.renderHtml = this.renderHtml.bind(this);
    this.getHighlightedBody = this.getHighlightedBody.bind(this);
  }

  initCurrentRenderingContext() {
    this.currentRenderingContext = {
      markdown: this.props.markdown,
      currentPagePath: this.props.pageContainer.state.path,
    };
  }

  componentDidMount() {
    this.initCurrentRenderingContext();
    this.renderHtml();
  }

  componentDidUpdate(prevProps) {
    const { markdown: prevMarkdown, highlightKeywords: prevHighlightKeywords } = prevProps;
    const { markdown, highlightKeywords } = this.props;

    // render only when props.markdown is updated
    if (markdown !== prevMarkdown || highlightKeywords !== prevHighlightKeywords) {
      this.initCurrentRenderingContext();
      this.renderHtml();
      return;
    }

    const { interceptorManager } = this.props.appContainer;

    interceptorManager.process('postRenderHtml', this.currentRenderingContext);
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

  async renderHtml() {
    const {
      appContainer, growiRenderer,
      highlightKeywords,
    } = this.props;

    const { interceptorManager } = appContainer;
    const context = this.currentRenderingContext;

    await interceptorManager.process('preRender', context);
    await interceptorManager.process('prePreProcess', context);
    context.markdown = growiRenderer.preProcess(context.markdown);
    await interceptorManager.process('postPreProcess', context);
    context.parsedHTML = growiRenderer.process(context.markdown);
    await interceptorManager.process('prePostProcess', context);
    context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);

    if (this.props.highlightKeywords != null) {
      context.parsedHTML = this.getHighlightedBody(context.parsedHTML, highlightKeywords);
    }
    await interceptorManager.process('postPostProcess', context);
    await interceptorManager.process('preRenderHtml', context);

    this.setState({ html: context.parsedHTML });
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
