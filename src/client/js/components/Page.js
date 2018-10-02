import React from 'react';
import PropTypes from 'prop-types';

import RevisionBody from './Page/RevisionBody';
import HandsontableModal from './PageEditor/HandsontableModal';
import MarkdownTable from '../models/MarkdownTable';

export default class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
      markdown: ''
    };

    this.appendEditSectionButtons = this.appendEditSectionButtons.bind(this);
    this.renderHtml = this.renderHtml.bind(this);
    this.getHighlightedBody = this.getHighlightedBody.bind(this);
  }

  componentWillMount() {
    this.renderHtml(this.props.markdown, this.props.highlightKeywords);
  }

  componentDidUpdate() {
    this.appendEditSectionButtons();
  }

  componentWillReceiveProps(nextProps) {
    this.renderHtml(nextProps.markdown, nextProps.highlightKeywords);
  }

  setMarkdown(markdown) {
    this.renderHtml(markdown, this.props.highlightKeywords);
  }

  /**
   * Add edit section buttons to headers
   * This invoke `appendEditSectionButtons` method of `legacy/crowi.js`
   *
   * TODO: transplant `appendEditSectionButtons` to this class in the future
   */
  appendEditSectionButtons(parentElement) {
    if (this.props.showHeadEditButton) {
      const crowiForJquery = this.props.crowi.getCrowiForJquery();
      crowiForJquery.appendEditSectionButtons(this.revisionBodyElement);
    }
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

  launchHandsonTableModal(beginLineNumber, endLineNumber) {
    const tableLines = this.state.markdown.split('\n').slice(beginLineNumber - 1, endLineNumber).join('\n');
    this.refs.handsontableModal.show(MarkdownTable.fromMarkdownString(tableLines));
  }

  renderHtml(markdown, highlightKeywords) {
    var context = {
      markdown,
      dom: this.revisionBodyElement,
      currentPagePath: this.props.pagePath,
    };

    const crowiRenderer = this.props.crowiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRender', context)
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
        context.parsedHTML = crowiRenderer.postProcess(context.parsedHTML, context.dom);

        // highlight
        if (highlightKeywords != null) {
          context.parsedHTML = this.getHighlightedBody(context.parsedHTML, highlightKeywords);
        }
      })
      .then(() => interceptorManager.process('postPostProcess', context))
      .then(() => interceptorManager.process('preRenderHtml', context))
      .then(() => {
        this.setState({ html: context.parsedHTML, markdown });
      })
      // process interceptors for post rendering
      .then(() => interceptorManager.process('postRenderHtml', context));

  }

  render() {
    const config = this.props.crowi.getConfig();
    const isMobile = this.props.crowi.isMobile;
    const isMathJaxEnabled = !!config.env.MATHJAX;

    return <div className={isMobile ? 'page-mobile' : ''}>
      <RevisionBody
          html={this.state.html}
          inputRef={el => this.revisionBodyElement = el}
          isMathJaxEnabled={isMathJaxEnabled}
          renderMathJaxOnInit={true}
      />
      <HandsontableModal ref='handsontableModal' />
    </div>;
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
