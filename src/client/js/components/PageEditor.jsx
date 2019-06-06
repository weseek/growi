import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { throttle, debounce } from 'throttle-debounce';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import { createSubscribedElement } from './UnstatedUtils';
import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';
import scrollSyncHelper from './PageEditor/ScrollSyncHelper';
import EditorContainer from '../services/EditorContainer';

const logger = loggerFactory('growi:PageEditor');

class PageEditor extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.appContainer.getConfig();
    const isUploadable = config.upload.image || config.upload.file;
    const isUploadableFile = config.upload.file;
    const isMathJaxEnabled = !!config.env.MATHJAX;

    this.state = {
      markdown: this.props.pageContainer.state.markdown,
      isUploadable,
      isUploadableFile,
      isMathJaxEnabled,
    };

    this.setCaretLine = this.setCaretLine.bind(this);
    this.focusToEditor = this.focusToEditor.bind(this);
    this.onMarkdownChanged = this.onMarkdownChanged.bind(this);
    this.onSaveWithShortcut = this.onSaveWithShortcut.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onEditorScroll = this.onEditorScroll.bind(this);
    this.onEditorScrollCursorIntoView = this.onEditorScrollCursorIntoView.bind(this);
    this.onPreviewScroll = this.onPreviewScroll.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.clearDraft = this.clearDraft.bind(this);
    this.showUnsavedWarning = this.showUnsavedWarning.bind(this);

    // get renderer
    this.growiRenderer = this.props.appContainer.getRenderer('editor');

    // for scrolling
    this.lastScrolledDateWithCursor = null;
    this.isOriginOfScrollSyncEditor = false;
    this.isOriginOfScrollSyncEditor = false;

    // create throttled function
    this.scrollPreviewByEditorLineWithThrottle = throttle(20, this.scrollPreviewByEditorLine);
    this.scrollPreviewByCursorMovingWithThrottle = throttle(20, this.scrollPreviewByCursorMoving);
    this.scrollEditorByPreviewScrollWithThrottle = throttle(20, this.scrollEditorByPreviewScroll);
    this.renderPreviewWithDebounce = debounce(50, throttle(100, this.renderPreview));
    this.saveDraftWithDebounce = debounce(800, this.saveDraft);

  }

  componentWillMount() {
    this.props.appContainer.registerComponentInstance(this);

    // initial rendering
    this.renderPreview(this.state.markdown);

    window.addEventListener('beforeunload', this.showUnsavedWarning);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.showUnsavedWarning);
  }

  showUnsavedWarning(e) {
    if (!this.props.appContainer.getIsDocSaved()) {
      // display browser default message
      e.returnValue = '';
      return '';
    }
  }

  getMarkdown() {
    return this.state.markdown;
  }

  updateEditorValue(markdown) {
    this.editor.setValue(markdown);
  }

  focusToEditor() {
    this.editor.forceToFocus();
  }

  /**
   * set caret position of editor
   * @param {number} line
   */
  setCaretLine(line) {
    this.editor.setCaretLine(line);
    scrollSyncHelper.scrollPreview(this.previewElement, line);
  }

  /**
   * the change event handler for `markdown` state
   * @param {string} value
   */
  onMarkdownChanged(value) {
    this.renderPreviewWithDebounce(value);
    this.saveDraftWithDebounce();
    this.props.appContainer.setIsDocSaved(false);
  }

  /**
   * save and update state of containers
   */
  async onSaveWithShortcut() {
    const { pageContainer, editorContainer } = this.props;
    const optionsToSave = editorContainer.getCurrentOptionsToSave();

    try {
      // eslint-disable-next-line no-unused-vars
      const { page, tags } = await pageContainer.save(this.state.markdown, optionsToSave);
      logger.debug('success to save');

      pageContainer.showSuccessToastr();

      // update state of EditorContainer
      editorContainer.setState({ tags });
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
  }

  /**
   * the upload event handler
   * @param {any} file
   */
  async onUpload(file) {
    const { appContainer, pageContainer } = this.props;

    try {
      let res = await appContainer.apiGet('/attachments.limit', {
        fileSize: file.size,
      });

      if (!res.isUploadable) {
        throw new Error(res.errorMessage);
      }

      const formData = new FormData();
      formData.append('_csrf', appContainer.csrfToken);
      formData.append('file', file);
      formData.append('path', pageContainer.state.path);
      formData.append('page_id', this.state.pageId || 0);

      res = await appContainer.apiPost('/attachments.add', formData);
      const attachment = res.attachment;
      const fileName = attachment.originalName;

      let insertText = `[${fileName}](${attachment.filePathProxied})`;
      // when image
      if (attachment.fileFormat.startsWith('image/')) {
        // modify to "![fileName](url)" syntax
        insertText = `!${insertText}`;
      }
      this.editor.insertText(insertText);

      // when if created newly
      if (res.pageCreated) {
        // do nothing
      }
    }
    catch (e) {
      logger.error('failed to upload', e);
      pageContainer.showErrorToastr(e);
    }
    finally {
      this.editor.terminateUploadingState();
    }
  }

  /**
   * the scroll event handler from codemirror
   * @param {any} data {left, top, width, height, clientWidth, clientHeight} object that represents the current scroll position,
   *                    the size of the scrollable area, and the size of the visible area (minus scrollbars).
   *                    And data.line is also available that is added by Editor component
   * @see https://codemirror.net/doc/manual.html#events
   */
  onEditorScroll(data) {
    // prevent scrolling
    //   if the elapsed time from last scroll with cursor is shorter than 40ms
    const now = new Date();
    if (now - this.lastScrolledDateWithCursor < 40) {
      return;
    }

    this.scrollPreviewByEditorLineWithThrottle(data.line);
  }

  /**
   * the scroll event handler from codemirror
   * @param {number} line
   * @see https://codemirror.net/doc/manual.html#events
   */
  onEditorScrollCursorIntoView(line) {
    // record date
    this.lastScrolledDateWithCursor = new Date();
    this.scrollPreviewByCursorMovingWithThrottle(line);
  }

  /**
   * scroll Preview element by scroll event
   * @param {number} line
   */
  scrollPreviewByEditorLine(line) {
    if (this.previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (this.isOriginOfScrollSyncPreview) {
      this.isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    this.isOriginOfScrollSyncEditor = true;
    scrollSyncHelper.scrollPreview(this.previewElement, line);
  }

  /**
   * scroll Preview element by cursor moving
   * @param {number} line
   */
  scrollPreviewByCursorMoving(line) {
    if (this.previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (this.isOriginOfScrollSyncPreview) {
      this.isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    this.isOriginOfScrollSyncEditor = true;
    scrollSyncHelper.scrollPreviewToRevealOverflowing(this.previewElement, line);
  }

  /**
   * the scroll event handler from Preview component
   * @param {number} offset
   */
  onPreviewScroll(offset) {
    this.scrollEditorByPreviewScrollWithThrottle(offset);
  }

  /**
   * scroll Editor component by scroll event of Preview component
   * @param {number} offset
   */
  scrollEditorByPreviewScroll(offset) {
    if (this.previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (this.isOriginOfScrollSyncEditor) {
      this.isOriginOfScrollSyncEditor = false; // turn off the flag
      return;
    }

    // turn on the flag
    this.isOriginOfScrollSyncPreview = true;
    scrollSyncHelper.scrollEditor(this.editor, this.previewElement, offset);
  }

  saveDraft() {
    const { pageContainer, editorContainer } = this.props;
    // only when the first time to edit
    if (!pageContainer.state.revisionId) {
      editorContainer.saveDraft(pageContainer.state.path, this.state.markdown);
    }
  }

  clearDraft() {
    this.props.editorContainer.clearDraft(this.props.pageContainer.state.path);
  }

  renderPreview(value) {
    this.setState({ markdown: value });

    // render html
    const context = {
      markdown: this.state.markdown,
      currentPagePath: decodeURIComponent(window.location.pathname),
    };

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.appContainer.interceptorManager;
    interceptorManager.process('preRenderPreview', context)
      .then(() => { return interceptorManager.process('prePreProcess', context) })
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => { return interceptorManager.process('postPreProcess', context) })
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context.parsedHTML = parsedHTML;
      })
      .then(() => { return interceptorManager.process('prePostProcess', context) })
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
      })
      .then(() => { return interceptorManager.process('postPostProcess', context) })
      .then(() => { return interceptorManager.process('preRenderPreviewHtml', context) })
      .then(() => {
        this.setState({ html: context.parsedHTML });
      })
      // process interceptors for post rendering
      .then(() => { return interceptorManager.process('postRenderPreviewHtml', context) });

  }

  render() {
    const config = this.props.appContainer.getConfig();
    const noCdn = !!config.env.NO_CDN;
    const emojiStrategy = this.props.appContainer.getEmojiStrategy();

    return (
      <div className="row">
        <div className="col-md-6 col-sm-12 page-editor-editor-container">
          <Editor
            ref={(c) => { this.editor = c }}
            value={this.state.markdown}
            noCdn={noCdn}
            isMobile={this.props.appContainer.isMobile}
            isUploadable={this.state.isUploadable}
            isUploadableFile={this.state.isUploadableFile}
            emojiStrategy={emojiStrategy}
            onScroll={this.onEditorScroll}
            onScrollCursorIntoView={this.onEditorScrollCursorIntoView}
            onChange={this.onMarkdownChanged}
            onUpload={this.onUpload}
            onSave={this.onSaveWithShortcut}
          />
        </div>
        <div className="col-md-6 hidden-sm hidden-xs page-editor-preview-container">
          <Preview
            html={this.state.html}
            // eslint-disable-next-line no-return-assign
            inputRef={(el) => { return this.previewElement = el }}
            isMathJaxEnabled={this.state.isMathJaxEnabled}
            renderMathJaxOnInit={false}
            onScroll={this.onPreviewScroll}
          />
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageEditorWrapper = (props) => {
  return createSubscribedElement(PageEditor, props, [AppContainer, PageContainer, EditorContainer]);
};

PageEditor.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default PageEditorWrapper;
