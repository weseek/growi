import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import GrowiRenderer from '~/client/util/GrowiRenderer';
import { addSmoothScrollEvent } from '~/client/util/smooth-scroll';
import { blinkElem } from '~/client/util/blink-section-header';

import RevisionBody from './RevisionBody';
import { loggerFactory } from '^/../codemirror-textlint/src/utils/logger';

const logger = loggerFactory('components:Page:RevisionRenderer');

class LegacyRevisionRenderer extends React.PureComponent {

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
      currentPagePath: decodeURIComponent(window.location.pathname),
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

    const HeaderLink = document.getElementsByClassName('revision-head-link');
    const HeaderLinkArray = Array.from(HeaderLink);
    addSmoothScrollEvent(HeaderLinkArray, blinkElem);

    const { interceptorManager } = this.props.appContainer;

    interceptorManager.process('postRenderHtml', this.currentRenderingContext);
  }

  /**
   * transplanted from legacy code -- Yuki Takei
   * @param {string} body html strings
   * @param {string} keywords
   */
  getHighlightedBody(body, keywords) {
    const normalizedKeywordsArray = [];
    // !!TODO!!: add test code
    // Separate keywords
    // - Surrounded by double quotation
    // - Split by both full-width and half-width spaces
    [...keywords.match(/"[^"]+"|[^\u{20}\u{3000}]+/ug)].forEach((separatedKeyword, i) => {
      // Removes double quotes from keywords and trims start and end blanks
      const keyword = separatedKeyword.replace(/"/g, '').trim();
      if (keyword === '') {
        return;
      }
      const k = keyword
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex operators
        .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
      normalizedKeywordsArray.push(k);
    });

    const normalizedKeywords = `(${normalizedKeywordsArray.join('|')})`;
    const keywordRegxp = new RegExp(`${normalizedKeywords}(?!(.*?"))`, 'ig'); // prior https://regex101.com/r/oX7dq5/1
    let keywordRegexp2 = keywordRegxp;

    // for non-chrome browsers compatibility
    try {
      keywordRegexp2 = new RegExp(`(?<!<)${normalizedKeywords}(?!(.*?("|>)))`, 'ig'); // inferior (this doesn't work well when html tags exist a lot) https://regex101.com/r/Dfi61F/1
    }
    catch (err) {
      logger.debug('Failed to initialize regex:', err);
    }

    const highlighter = (str) => { return str.replace(keywordRegxp, '<em class="highlighted-keyword">$&</em>') }; // prior
    const highlighter2 = (str) => { return str.replace(keywordRegexp2, '<em class="highlighted-keyword">$&</em>') }; // inferior

    const insideTagRegex = /<[^<>]*>/g;
    const betweenTagRegex = />([^<>]*)</g; // use (group) to ignore >< around

    const insideTagStrs = body.match(insideTagRegex);
    const betweenTagMatches = Array.from(body.matchAll(betweenTagRegex));

    let returnBody = body;
    const isSafeHtml = insideTagStrs.length === betweenTagMatches.length + 1; // to check whether is safe to join
    if (isSafeHtml) {
      // highlight
      const betweenTagStrs = betweenTagMatches.map(match => highlighter(match[1])); // get only grouped part (exclude >< around)

      const arr = [];
      insideTagStrs.forEach((str, i) => {
        arr.push(str);
        arr.push(betweenTagStrs[i]);
      });
      returnBody = arr.join('');
    }
    else {
      // inferior highlighter
      returnBody = highlighter2(body);
    }

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

    if (highlightKeywords != null) {
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
        additionalClassName={this.props.additionalClassName}
        renderMathJaxOnInit
      />
    );
  }

}

LegacyRevisionRenderer.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  markdown: PropTypes.string.isRequired,
  highlightKeywords: PropTypes.string,
  additionalClassName: PropTypes.string,
};

/**
 * Wrapper component for using unstated
 */
const LegacyRevisionRendererWrapper = withUnstatedContainers(LegacyRevisionRenderer, [AppContainer]);


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const RevisionRenderer = (props) => {
  return <LegacyRevisionRendererWrapper {...props} />;
};

RevisionRenderer.propTypes = {
  growiRenderer: PropTypes.instanceOf(GrowiRenderer).isRequired,
  markdown: PropTypes.string.isRequired,
  highlightKeywords: PropTypes.string,
  additionalClassName: PropTypes.string,
};

export default RevisionRenderer;
