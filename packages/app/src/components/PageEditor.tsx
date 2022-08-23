import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import EventEmitter from 'events';

import { envUtils } from '@growi/core';
import detectIndent from 'detect-indent';
import { throttle, debounce } from 'throttle-debounce';

// import AppContainer from '~/client/services/AppContainer';
// import EditorContainer from '~/client/services/EditorContainer';
// import PageContainer from '~/client/services/PageContainer';
import { apiGet, apiPostForm } from '~/client/util/apiv1-client';
import { getOptionsToSave } from '~/client/util/editor';
import {
  useIsEditable, useIsIndentSizeForced, useCurrentPagePath, useCurrentPageId, useIsUploadableFile, useIsUploadableImage,
} from '~/stores/context';
import {
  useCurrentIndentSize, useSWRxSlackChannels, useIsSlackEnabled, useIsTextlintEnabled, usePageTagsForEditors,
  useIsEnabledUnsavedWarning,
} from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { usePreviewOptions } from '~/stores/renderer';
import {
  EditorMode,
  useEditorMode, useIsMobile, useSelectedGrant,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';


// import { ConflictDiffModal } from './PageEditor/ConflictDiffModal';
import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';
import scrollSyncHelper from './PageEditor/ScrollSyncHelper';
// import { withUnstatedContainers } from './UnstatedUtils';


// TODO: remove this when omitting unstated is completed

const logger = loggerFactory('growi:PageEditor');


declare const globalEmitter: EventEmitter;


type EditorRef = {
  setValue: (markdown: string) => void,
  setCaretLine: (line: number) => void,
  insertText: (text: string) => void,
  forceToFocus: () => void,
  terminateUploadingState: () => void,
}

type Props = {
  // appContainer: AppContainer,
  // pageContainer: PageContainer,
  // editorContainer: EditorContainer,

  // isEditable: boolean,

  // editorMode: string,
  // isSlackEnabled: boolean,
  // slackChannels: string,
  // isMobile?: boolean,

  // grant: number,
  // grantGroupId?: string,
  // grantGroupName?: string,
  // mutateGrant: (grant: number) => void,

  // isTextlintEnabled?: boolean,
  // isIndentSizeForced?: boolean,
  // indentSize?: number,
  // mutateCurrentIndentSize: (indent: number) => void,
};

// for scrolling
let lastScrolledDateWithCursor: Date | null = null;
let isOriginOfScrollSyncEditor = false;
let isOriginOfScrollSyncPreview = false;

const PageEditor = (props: Props): JSX.Element => {
  // const {
  //   appContainer, pageContainer, editorContainer,
  // } = props;

  const { data: isEditable } = useIsEditable();
  const { data: editorMode } = useEditorMode();
  const { data: isMobile } = useIsMobile();
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags } = usePageTagsForEditors(pageId);
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: isTextlintEnabled } = useIsTextlintEnabled();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();
  const { data: indentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const { data: isUploadableFile } = useIsUploadableFile();
  const { data: isUploadableImage } = useIsUploadableImage();
  const { data: currentPage } = useSWRxCurrentPage();

  const { data: rendererOptions } = usePreviewOptions();

  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    if (currentPage != null) {
      setMarkdown(currentPage.revision?.body);
    }
  }, [currentPage, currentPage?.revision?.body]);


  const editorRef = useRef<EditorRef>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const setMarkdownWithDebounce = useMemo(() => debounce(50, throttle(100, value => setMarkdown(value))), []);
  // const saveDraftWithDebounce = useMemo(() => debounce(800, () => {
  //   editorContainer.saveDraft(pageContainer.state.path, markdown);
  // }), [editorContainer, markdown, pageContainer.state.path]);

  const markdownChangedHandler = useCallback((value: string): void => {
    setMarkdownWithDebounce(value);
    // only when the first time to edit
    // if (!pageContainer.state.revisionId) {
    //   saveDraftWithDebounce();
    // }
  // }, [pageContainer.state.revisionId, saveDraftWithDebounce, setMarkdownWithDebounce]);
  }, [setMarkdownWithDebounce]);


  const saveWithShortcut = useCallback(async() => {
    if (grantData == null) {
      return;
    }

    const slackChannels = slackChannelsData ? slackChannelsData.toString() : '';

    const optionsToSave = getOptionsToSave(
      isSlackEnabled ?? false, slackChannels,
      grantData.grant, grantData.grantedGroup?.id, grantData.grantedGroup?.name,
      pageTags || [],
    );

    try {
      // disable unsaved warning
      mutateIsEnabledUnsavedWarning(false);

      // eslint-disable-next-line no-unused-vars
      // const { tags } = await pageContainer.save(markdown, editorMode, optionsToSave);
      logger.debug('success to save');

      // pageContainer.showSuccessToastr();

      // update state of EditorContainer
      // editorContainer.setState({ tags });
    }
    catch (error) {
      logger.error('failed to save', error);
      // pageContainer.showErrorToastr(error);
    }
  }, [grantData, isSlackEnabled, slackChannelsData, pageTags, mutateIsEnabledUnsavedWarning]);


  /**
   * the upload event handler
   * @param {any} file
   */
  const uploadHandler = useCallback(async(file) => {
    if (editorRef.current == null) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let res: any = await apiGet('/attachments.limit', {
        fileSize: file.size,
      });

      if (!res.isUploadable) {
        throw new Error(res.errorMessage);
      }

      const formData = new FormData();
      // const { pageId, path } = pageContainer.state;
      formData.append('file', file);
      if (currentPagePath != null) {
        formData.append('path', currentPagePath);
      }
      if (pageId != null) {
        formData.append('page_id', pageId);
      }

      res = await apiPostForm('/attachments.add', formData);
      const attachment = res.attachment;
      const fileName = attachment.originalName;

      let insertText = `[${fileName}](${attachment.filePathProxied})`;
      // when image
      if (attachment.fileFormat.startsWith('image/')) {
        // modify to "![fileName](url)" syntax
        insertText = `!${insertText}`;
      }
      editorRef.current.insertText(insertText);

      // when if created newly
      if (res.pageCreated) {
        logger.info('Page is created', res.page._id);
        // pageContainer.updateStateAfterSave(res.page, res.tags, res.revision, editorMode);
        mutateGrant(res.page.grant);
      }
    }
    catch (e) {
      logger.error('failed to upload', e);
      // pageContainer.showErrorToastr(e);
    }
    finally {
      editorRef.current.terminateUploadingState();
    }
  // }, [editorMode, mutateGrant, pageContainer]);
  }, [editorMode, mutateGrant]);


  const scrollPreviewByEditorLine = useCallback((line: number) => {
    if (previewRef.current == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncPreview) {
      isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    isOriginOfScrollSyncEditor = true;
    scrollSyncHelper.scrollPreview(previewRef.current, line);
  }, []);
  const scrollPreviewByEditorLineWithThrottle = useMemo(() => throttle(20, scrollPreviewByEditorLine), [scrollPreviewByEditorLine]);

  /**
   * the scroll event handler from codemirror
   * @param {any} data {left, top, width, height, clientWidth, clientHeight} object that represents the current scroll position,
   *                    the size of the scrollable area, and the size of the visible area (minus scrollbars).
   *                    And data.line is also available that is added by Editor component
   * @see https://codemirror.net/doc/manual.html#events
   */
  const editorScrolledHandler = useCallback(({ line }: { line: number }) => {
    // prevent scrolling
    //   if the elapsed time from last scroll with cursor is shorter than 40ms
    const now = new Date();
    if (lastScrolledDateWithCursor != null && now.getTime() - lastScrolledDateWithCursor.getTime() < 40) {
      return;
    }

    scrollPreviewByEditorLineWithThrottle(line);
  }, [scrollPreviewByEditorLineWithThrottle]);

  /**
   * scroll Preview element by cursor moving
   * @param {number} line
   */
  const scrollPreviewByCursorMoving = useCallback((line: number) => {
    if (previewRef.current == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncPreview) {
      isOriginOfScrollSyncPreview = false; // turn off the flag
      return;
    }

    // turn on the flag
    isOriginOfScrollSyncEditor = true;
    if (previewRef.current != null) {
      scrollSyncHelper.scrollPreviewToRevealOverflowing(previewRef.current, line);
    }
  }, []);
  const scrollPreviewByCursorMovingWithThrottle = useMemo(() => throttle(20, scrollPreviewByCursorMoving), [scrollPreviewByCursorMoving]);

  /**
   * the scroll event handler from codemirror
   * @param {number} line
   * @see https://codemirror.net/doc/manual.html#events
   */
  const editorScrollCursorIntoViewHandler = useCallback((line: number) => {
    // record date
    lastScrolledDateWithCursor = new Date();
    scrollPreviewByCursorMovingWithThrottle(line);
  }, [scrollPreviewByCursorMovingWithThrottle]);

  /**
   * scroll Editor component by scroll event of Preview component
   * @param {number} offset
   */
  const scrollEditorByPreviewScroll = useCallback((offset: number) => {
    if (editorRef.current == null || previewRef.current == null) {
      return;
    }

    // prevent circular invocation
    if (isOriginOfScrollSyncEditor) {
      isOriginOfScrollSyncEditor = false; // turn off the flag
      return;
    }

    // turn on the flag
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isOriginOfScrollSyncPreview = true;

    scrollSyncHelper.scrollEditor(editorRef.current, previewRef.current, offset);
  }, []);
  const scrollEditorByPreviewScrollWithThrottle = useMemo(() => throttle(20, scrollEditorByPreviewScroll), [scrollEditorByPreviewScroll]);


  // register dummy instance to get markdown
  useEffect(() => {
    const pageEditorInstance = {
      getMarkdown: () => {
        return markdown;
      },
    };
    // appContainer.registerComponentInstance('PageEditor', pageEditorInstance);
  }, [markdown]);

  // initial caret line
  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.setCaretLine(0);
    }
  }, []);

  // set handler to set caret line
  useEffect(() => {
    const handler = (line) => {
      if (editorRef.current != null) {
        editorRef.current.setCaretLine(line);
      }
      if (previewRef.current != null) {
        scrollSyncHelper.scrollPreview(previewRef.current, line);
      }
    };
    globalEmitter.on('setCaretLine', handler);

    return function cleanup() {
      globalEmitter.removeListener('setCaretLine', handler);
    };
  }, []);

  // set handler to focus
  useEffect(() => {
    if (editorRef.current != null && editorMode === EditorMode.Editor) {
      editorRef.current.forceToFocus();
    }
  }, [editorMode]);

  // set handler to update editor value
  useEffect(() => {
    const handler = (markdown) => {
      if (editorRef.current != null) {
        editorRef.current.setValue(markdown);
      }
    };
    globalEmitter.on('updateEditorValue', handler);

    return function cleanup() {
      globalEmitter.removeListener('updateEditorValue', handler);
    };
  }, []);

  // Displays an alert if there is a difference with pageContainer's markdown
  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   if (pageContainer.state.markdown! !== markdown) {
  //     mutateIsEnabledUnsavedWarning(true);
  //   }
  // }, [editorContainer, markdown, mutateIsEnabledUnsavedWarning, pageContainer.state.markdown]);

  // Detect indent size from contents (only when users are allowed to change it)
  // useEffect(() => {
  //   const currentPageMarkdown = pageContainer.state.markdown;
  //   if (!isIndentSizeForced && currentPageMarkdown != null) {
  //     const detectedIndent = detectIndent(currentPageMarkdown);
  //     if (detectedIndent.type === 'space' && new Set([2, 4]).has(detectedIndent.amount)) {
  //       mutateCurrentIndentSize(detectedIndent.amount);
  //     }
  //   }
  // }, [isIndentSizeForced, mutateCurrentIndentSize, pageContainer.state.markdown]);


  if (!isEditable) {
    return <></>;
  }

  if (rendererOptions == null) {
    return <></>;
  }

  const isUploadable = isUploadableImage || isUploadableFile;


  return (
    <div className="d-flex flex-wrap">
      <div className="page-editor-editor-container flex-grow-1 flex-basis-0 mw-0">
        <Editor
          ref={editorRef}
          value={markdown}
          isUploadable={isUploadable}
          isUploadableFile={isUploadableFile}
          isTextlintEnabled={isTextlintEnabled}
          indentSize={indentSize}
          onScroll={editorScrolledHandler}
          onScrollCursorIntoView={editorScrollCursorIntoViewHandler}
          onChange={markdownChangedHandler}
          onUpload={uploadHandler}
          onSave={() => saveWithShortcut()}
        />
      </div>
      <div className="d-none d-lg-block page-editor-preview-container flex-grow-1 flex-basis-0 mw-0">
        <Preview
          markdown={markdown}
          rendererOptions={rendererOptions}
          ref={previewRef}
          renderMathJaxOnInit={false}
          onScroll={offset => scrollEditorByPreviewScrollWithThrottle(offset)}
        />
      </div>
      {/* <ConflictDiffModal
        isOpen={pageContainer.state.isConflictDiffModalOpen}
        onClose={() => pageContainer.setState({ isConflictDiffModalOpen: false })}
        pageContainer={pageContainer}
        markdownOnEdit={markdown}
      /> */}
    </div>
  );
};

/**
   * Wrapper component for using unstated
   */
// const PageEditorWrapper = withUnstatedContainers(PageEditor, [AppContainer, PageContainer, EditorContainer]);

// export default PageEditorWrapper;
export default PageEditor;
