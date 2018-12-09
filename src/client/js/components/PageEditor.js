import React from 'react';
import PropTypes from 'prop-types';

import { throttle, debounce } from 'throttle-debounce';

import GrowiRenderer from '../util/GrowiRenderer';

import { EditorOptions, PreviewOptions } from './PageEditor/OptionsSelector';
import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';
import scrollSyncHelper from './PageEditor/ScrollSyncHelper';

export default class PageEditor extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isUploadable = config.upload.image || config.upload.file;
    const isUploadableFile = config.upload.file;
    const isMathJaxEnabled = !!config.env.MATHJAX;

    this.state = {
      pageId: this.props.pageId,
      revisionId: this.props.revisionId,
      markdown: this.props.markdown,
      isUploadable,
      isUploadableFile,
      isMathJaxEnabled,
      editorOptions: this.props.editorOptions,
      previewOptions: this.props.previewOptions,
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiRenderer, {mode: 'editor'});

    this.setCaretLine = this.setCaretLine.bind(this);
    this.focusToEditor = this.focusToEditor.bind(this);
    this.onMarkdownChanged = this.onMarkdownChanged.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onEditorScroll = this.onEditorScroll.bind(this);
    this.onEditorScrollCursorIntoView = this.onEditorScrollCursorIntoView.bind(this);
    this.onPreviewScroll = this.onPreviewScroll.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.clearDraft = this.clearDraft.bind(this);

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
    // initial rendering
    this.renderPreview(this.state.markdown);
  }

  getMarkdown() {
    return this.state.markdown;
  }

  setMarkdown(markdown, updateEditorValue = true) {
    this.setState({ markdown });
    if (updateEditorValue) {
      this.refs.editor.setValue(markdown);
    }
  }

  focusToEditor() {
    this.refs.editor.forceToFocus();
  }

  /**
   * set caret position of editor
   * @param {number} line
   */
  setCaretLine(line) {
    this.refs.editor.setCaretLine(line);
    scrollSyncHelper.scrollPreview(this.previewElement, line);
  }

  /**
   * set options (used from the outside)
   * @param {object} editorOptions
   */
  setEditorOptions(editorOptions) {
    this.setState({ editorOptions });
  }

  /**
   * set options (used from the outside)
   * @param {object} previewOptions
   */
  setPreviewOptions(previewOptions) {
    this.setState({ previewOptions });
  }

  /**
   * the change event handler for `markdown` state
   * @param {string} value
   */
  onMarkdownChanged(value) {
    this.renderPreviewWithDebounce(value);
    this.saveDraftWithDebounce();
  }

  /**
   * the upload event handler
   * @param {any} files
   */
  onUpload(file) {
    const endpoint = '/attachments.add';

    // create a FromData instance
    const formData = new FormData();
    formData.append('_csrf', this.props.crowi.csrfToken);
    formData.append('file', file);
    formData.append('path', this.props.pagePath);
    formData.append('page_id', this.state.pageId || 0);

    // post
    this.props.crowi.apiPost(endpoint, formData)
      .then((res) => {
        const url = res.url;
        const attachment = res.attachment;
        const fileName = attachment.originalName;

        let insertText = `[${fileName}](${url})`;
        // when image
        if (attachment.fileFormat.startsWith('image/')) {
          // modify to "![fileName](url)" syntax
          insertText = '!' + insertText;
        }
        this.refs.editor.insertText(insertText);

        // when if created newly
        if (res.pageCreated) {
          // do nothing
        }
      })
      .catch(this.apiErrorHandler)
      // finally
      .then(() => {
        this.refs.editor.terminateUploadingState();
      });
  }

  /**
   * the scroll event handler from codemirror
   * @param {any} data {left, top, width, height, clientWidth, clientHeight} object that represents the current scroll position, the size of the scrollable area, and the size of the visible area (minus scrollbars).
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
      this.isOriginOfScrollSyncEditor = false;  // turn off the flag
      return;
    }

    // turn on the flag
    this.isOriginOfScrollSyncPreview = true;
    scrollSyncHelper.scrollEditor(this.refs.editor, this.previewElement, offset);
  }

  saveDraft() {
    // only when the first time to edit
    if (!this.state.revisionId) {
      this.props.crowi.saveDraft(this.props.pagePath, this.state.markdown);
    }
  }
  clearDraft() {
    this.props.crowi.clearDraft(this.props.pagePath);
  }

  renderPreview(value) {
    this.setState({ markdown: value });

    // render html
    const context = {
      markdown: this.state.markdown,
      currentPagePath: decodeURIComponent(location.pathname)
    };

    const growiRenderer = this.growiRenderer;
    const interceptorManager = this.props.crowi.interceptorManager;
    interceptorManager.process('preRenderPreview', context)
      .then(() => interceptorManager.process('prePreProcess', context))
      .then(() => {
        context.markdown = growiRenderer.preProcess(context.markdown);
      })
      .then(() => interceptorManager.process('postPreProcess', context))
      .then(() => {
        const parsedHTML = growiRenderer.process(context.markdown);
        context['parsedHTML'] = parsedHTML;
      })
      .then(() => interceptorManager.process('prePostProcess', context))
      .then(() => {
        context.parsedHTML = growiRenderer.postProcess(context.parsedHTML);
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
    const emojiStrategy = this.props.crowi.getEmojiStrategy();

    return (
      <div className="row">
        <div className="col-md-6 col-sm-12 page-editor-editor-container">
          <Editor ref="editor" value={this.state.markdown}
            editorOptions={this.state.editorOptions}
            isMobile={this.props.crowi.isMobile}
            isUploadable={this.state.isUploadable}
            isUploadableFile={this.state.isUploadableFile}
            emojiStrategy={emojiStrategy}
            onScroll={this.onEditorScroll}
            onScrollCursorIntoView={this.onEditorScrollCursorIntoView}
            onChange={this.onMarkdownChanged}
            onUpload={this.onUpload}
            onSave={() => {
              this.props.onSaveWithShortcut(this.state.markdown);
            }}
          />
        </div>
        <div className="col-md-6 hidden-sm hidden-xs page-editor-preview-container">
          <Preview html={this.state.html}
            inputRef={el => this.previewElement = el}
            isMathJaxEnabled={this.state.isMathJaxEnabled}
            renderMathJaxOnInit={false}
            previewOptions={this.state.previewOptions}
            onScroll={this.onPreviewScroll}
          />
        </div>
      </div>
    );
  }
}

PageEditor.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiRenderer: PropTypes.object.isRequired,
  onSaveWithShortcut: PropTypes.func.isRequired,
  markdown: PropTypes.string.isRequired,
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  pagePath: PropTypes.string,
  editorOptions: PropTypes.instanceOf(EditorOptions),
  previewOptions: PropTypes.instanceOf(PreviewOptions),
};
