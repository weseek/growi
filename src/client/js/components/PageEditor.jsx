import React, { useState, useRef } from 'react';

import { throttle, debounce } from 'throttle-debounce';
import { envUtils } from 'growi-commons';
import loggerFactory from '~/utils/logger';

import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';
import scrollSyncHelper from './PageEditor/ScrollSyncHelper';
import { useCurrentPageSWR } from '~/stores/page';
import { useIsMobile } from '~/stores/ui';
import { useEditorConfig } from '~/stores/context';

const logger = loggerFactory('growi:PageEditor');

const PageEditor = (props) => {
  const editor = useRef();
  const previewElement = useRef();

  const { data: currentPage } = useCurrentPageSWR();
  const { data: isMobile } = useIsMobile();
  const { data: config } = useEditorConfig();

  const [markdown, setMarkdown] = useState(currentPage?.revision?.body);
  const [isUploadable, setIsUploadable] = useState(config.upload.image || config.upload.file);
  const [isUploadableFile, setIsUploadableFile] = useState(config.upload.file);
  const [isMathJaxEnabled, setIsMathJaxEnabled] = useState(!!config.env.MATHJAX);

  // // for scrolling
  let lastScrolledDateWithCursor = null;
  let isOriginOfScrollSyncEditor = false;
  let isOriginOfScrollSyncPreview = false;


  /**
   * scroll Preview element by scroll event
   * @param {number} line
   */
  const scrollPreviewByEditorLine = (line) => {
    if (previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncPreview) {
      isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    isOriginOfScrollSyncEditor = true;
    scrollSyncHelper.scrollPreview(previewElement, line);
  };


  /**
   * scroll Preview element by cursor moving
   * @param {number} line
   */
  const scrollPreviewByCursorMoving = (line) => {
    if (previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncPreview) {
      isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    isOriginOfScrollSyncEditor = true;
    scrollSyncHelper.scrollPreviewToRevealOverflowing(previewElement, line);
  };

  /**
   * scroll Editor component by scroll event of Preview component
   * @param {number} offset
   */
  const scrollEditorByPreviewScroll = (offset) => {
    if (previewElement == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncEditor) {
      isOriginOfScrollSyncEditor = false; // turn off the flag
      return;
    }

    // turn on the flag
    isOriginOfScrollSyncPreview = true;
    scrollSyncHelper.scrollEditor(editor, previewElement, offset);
  };

  const saveDraft = () => {
    // const { pageContainer, editorContainer } = this.props;
    // editorContainer.saveDraft(pageContainer.state.path, this.state.markdown);
  };

  // create throttled function
  const scrollPreviewByEditorLineWithThrottle = throttle(20, scrollPreviewByEditorLine);
  const scrollPreviewByCursorMovingWithThrottle = throttle(20, scrollPreviewByCursorMoving);
  const scrollEditorByPreviewScrollWithThrottle = throttle(20, scrollEditorByPreviewScroll);
  const setMarkdownStateWithDebounce = debounce(50, throttle(100, (value) => {
    setMarkdown(value);
  }));
  const saveDraftWithDebounce = debounce(800, saveDraft);


  const getMarkdown = () => {
    return markdown;
  };

  const updateEditorValue = (markdown) => {
    editor.setValue(markdown);
  };

  const focusToEditor = () => {
    editor.forceToFocus();
  };

  /**
   * set caret position of editor
   * @param {number} line
   */
  const setCaretLine = (line) => {
    editor.setCaretLine(line);
    scrollSyncHelper.scrollPreview(previewElement, line);
  };

  /**
   * the change event handler for `markdown` state
   * @param {string} value
   */
  const onMarkdownChanged = (value) => {
    // const { pageContainer, editorContainer } = this.props;
    setMarkdownStateWithDebounce(value);
    // only when the first time to edit
    // if (!pageContainer.state.revisionId) {
    //   this.saveDraftWithDebounce();
    // }
    // editorContainer.enableUnsavedWarning();
  };

  /**
   * save and update state of containers
   */
  const onSaveWithShortcut = async() => {
  // const { pageContainer, editorContainer } = this.props;
  // const optionsToSave = editorContainer.getCurrentOptionsToSave();

    // try {
    //   // disable unsaved warning
    //   editorContainer.disableUnsavedWarning();

    //   // eslint-disable-next-line no-unused-vars
    //   const { page, tags } = await pageContainer.save(this.state.markdown, optionsToSave);
    //   logger.debug('success to save');

    //   pageContainer.showSuccessToastr();

  //   // update state of EditorContainer
  //   editorContainer.setState({ tags });
  // }
  // catch (error) {
  //   logger.error('failed to save', error);
  //   pageContainer.showErrorToastr(error);
  // }
  };

  /**
   * the upload event handler
   * @param {any} file
   */
  const onUpload = (file) => {
  // const { appContainer, pageContainer, editorContainer } = this.props;

    // try {
    //   let res = await appContainer.apiGet('/attachments.limit', {
    //     fileSize: file.size,
    //   });

    //   if (!res.isUploadable) {
    //     throw new Error(res.errorMessage);
    //   }

    //   const formData = new FormData();
    //   const { pageId, path } = pageContainer.state;
    //   formData.append('_csrf', appContainer.csrfToken);
    //   formData.append('file', file);
    //   formData.append('path', path);
    //   if (pageId != null) {
    //     formData.append('page_id', pageContainer.state.pageId);
    //   }

    //   res = await appContainer.apiPost('/attachments.add', formData);
    //   const attachment = res.attachment;
    //   const fileName = attachment.originalName;

    //   let insertText = `[${fileName}](${attachment.filePathProxied})`;
    //   // when image
    //   if (attachment.fileFormat.startsWith('image/')) {
    //     // modify to "![fileName](url)" syntax
    //     insertText = `!${insertText}`;
    //   }
    //   this.editor.insertText(insertText);

  //   // when if created newly
  //   if (res.pageCreated) {
  //     logger.info('Page is created', res.page._id);
  //     pageContainer.updateStateAfterSave(res.page, res.tags, res.revision);
  //     editorContainer.setState({ grant: res.page.grant });
  //   }
  // }
  // catch (e) {
  //   logger.error('failed to upload', e);
  //   pageContainer.showErrorToastr(e);
  // }
  // finally {
  //   this.editor.terminateUploadingState();
  // }
  };

  /**
   * the scroll event handler from codemirror
   * @param {any} data {left, top, width, height, clientWidth, clientHeight} object that represents the current scroll position,
   *                    the size of the scrollable area, and the size of the visible area (minus scrollbars).
   *                    And data.line is also available that is added by Editor component
   * @see https://codemirror.net/doc/manual.html#events
   */
  const onEditorScroll = (data) => {
    // prevent scrolling
    // if the elapsed time from last scroll with cursor is shorter than 40ms
    const now = new Date();
    if (now - lastScrolledDateWithCursor < 40) {
      return;
    }

    scrollPreviewByEditorLineWithThrottle(data.line);
  };

  /**
   * the scroll event handler from codemirror
   * @param {number} line
   * @see https://codemirror.net/doc/manual.html#events
   */
  const onEditorScrollCursorIntoView = (line) => {
    // record date
    lastScrolledDateWithCursor = new Date();
    scrollPreviewByCursorMovingWithThrottle(line);
  };


  /**
   * the scroll event handler from Preview component
   * @param {number} offset
   */
  const onPreviewScroll = (offset) => {
    scrollEditorByPreviewScrollWithThrottle(offset);
  };

  const constclearDraft = () => {
    // this.props.editorContainer.clearDraft(this.props.pageContainer.state.path);
  };

  const noCdn = envUtils.toBoolean(config.env.NO_CDN);
  // const emojiStrategy = this.props.appContainer.getEmojiStrategy();

  return (
    <div className="d-flex flex-wrap">
      <div className="page-editor-editor-container flex-grow-1 flex-basis-0 mw-0">
        <Editor
          ref={editor}
          value={markdown}
          noCdn={noCdn}
          isMobile={isMobile}
          isUploadable={isUploadable}
          isUploadableFile={isUploadableFile}
            // emojiStrategy={emojiStrategy}
          onScroll={onEditorScroll}
          onScrollCursorIntoView={onEditorScrollCursorIntoView}
          onChange={onMarkdownChanged}
          onUpload={onUpload}
          onSave={onSaveWithShortcut}
        />
      </div>
      <div className="d-none d-lg-block page-editor-preview-container flex-grow-1 flex-basis-0 mw-0">
        {/* <Preview
          markdown={markdown}
          inputRef={previewElement}
          isMathJaxEnabled={isMathJaxEnabled}
          renderMathJaxOnInit={false}
          onScroll={onPreviewScroll}
        /> */}
      </div>
    </div>
  );

};

export default PageEditor;
