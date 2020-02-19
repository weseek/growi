import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';
import { createSubscribedElement } from '../UnstatedUtils';

import RevisionBody from '../Page/RevisionBody';

import AppContainer from '../../services/AppContainer';
import EditorContainer from '../../services/EditorContainer';

/**
 * Wrapper component for Page/RevisionBody
 */
class Preview extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      html: '',
    };

    // get renderer
    this.growiRenderer = props.appContainer.getRenderer('editor');
  }

  componentDidMount() {
    this.initCurrentRenderingContext();
    this.renderPreview();
  }

  componentDidUpdate(prevProps) {
    const { markdown: prevMarkdown } = prevProps;
    const { markdown } = this.props;

    // render only when props.markdown is updated
    if (markdown !== prevMarkdown) {
      this.initCurrentRenderingContext();
      this.renderPreview();
      return;
    }

    const { interceptorManager } = this.props.appContainer;

    interceptorManager.process('postRenderPreviewHtml', this.currentRenderingContext);
  }

  initCurrentRenderingContext() {
    this.currentRenderingContext = {
      markdown: this.props.markdown,
      currentPagePath: decodeURIComponent(window.location.pathname),
    };
  }

  async renderPreview() {
    const { appContainer } = this.props;
    const { growiRenderer } = this;

    const { interceptorManager } = appContainer;
    const context = this.currentRenderingContext;

    await interceptorManager.process('preRenderPreview', context);
    await interceptorManager.process('prePreProcess', context);
    context.markdown = growiRenderer.preProcess(context.markdown);
    await interceptorManager.process('postPreProcess', context);
    context.parsedHTML = growiRenderer.process(context.markdown);
    await interceptorManager.process('prePostProcess', context);
    context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
    await interceptorManager.process('postPostProcess', context);
    await interceptorManager.process('preRenderPreviewHtml', context);

    this.setState({ html: context.parsedHTML });
  }

  render() {
    return (
      <Subscribe to={[EditorContainer]}>
        { editorContainer => (
          // eslint-disable-next-line arrow-body-style
          <div
            className="page-editor-preview-body"
            ref={(elm) => {
                this.previewElement = elm;
                this.props.inputRef(elm);
              }}
            onScroll={(event) => {
                if (this.props.onScroll != null) {
                  this.props.onScroll(event.target.scrollTop);
                }
              }}
          >
            <RevisionBody
              {...this.props}
              html={this.state.html}
              renderMathJaxInRealtime={editorContainer.state.previewOptions.renderMathJaxInRealtime}
            />
          </div>
        )}
      </Subscribe>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PreviewWrapper = (props) => {
  return createSubscribedElement(Preview, props, [AppContainer]);
};

Preview.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  markdown: PropTypes.string,
  inputRef: PropTypes.func.isRequired, // for getting div element
  isMathJaxEnabled: PropTypes.bool,
  renderMathJaxOnInit: PropTypes.bool,
  onScroll: PropTypes.func,
};

export default PreviewWrapper;
