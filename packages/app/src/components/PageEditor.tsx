import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import EventEmitter from 'events';

import { envUtils, PageGrant } from '@growi/core';
import detectIndent from 'detect-indent';
import { useTranslation } from 'next-i18next';
import { throttle, debounce } from 'throttle-debounce';

import { saveOrUpdate } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiGet, apiPostForm } from '~/client/util/apiv1-client';
import { getOptionsToSave } from '~/client/util/editor';
import { IEditorMethods } from '~/interfaces/editor-methods';
import {
  useCurrentPagePath, useCurrentPathname, useCurrentPageId, useEditingMarkdown,
  useIsEditable, useIsIndentSizeForced, useIsUploadableFile, useIsUploadableImage,
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


const logger = loggerFactory('growi:PageEditor');


declare const globalEmitter: EventEmitter;


// for scrolling
let lastScrolledDateWithCursor: Date | null = null;
let isOriginOfScrollSyncEditor = false;
let isOriginOfScrollSyncPreview = false;

const PageEditor = React.memo((): JSX.Element => {

  const { t } = useTranslation();
  const { data: pageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPathname } = useCurrentPathname();
  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const { data: editingMarkdown } = useEditingMarkdown();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: pageTags } = usePageTagsForEditors(pageId);

  const { data: isEditable } = useIsEditable();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: isMobile } = useIsMobile();
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isTextlintEnabled } = useIsTextlintEnabled();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();
  const { data: indentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const { data: isUploadableFile } = useIsUploadableFile();
  const { data: isUploadableImage } = useIsUploadableImage();

  const { data: rendererOptions } = usePreviewOptions();

  const currentRevisionId = currentPage?.revision?._id;
  const initialValue = editingMarkdown ?? '';

  const markdownToSave = useRef<string>(initialValue);
  const [markdownToPreview, setMarkdownToPreview] = useState<string>(initialValue);

  const slackChannels = useMemo(() => (slackChannelsData ? slackChannelsData.toString() : ''), [slackChannelsData]);


  const editorRef = useRef<IEditorMethods>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const setMarkdownWithDebounce = useMemo(() => debounce(100, throttle(150, (value: string, isClean: boolean) => {
    markdownToSave.current = value;
    setMarkdownToPreview(value);

    // Displays an unsaved warning alert
    mutateIsEnabledUnsavedWarning(!isClean);
  })), [mutateIsEnabledUnsavedWarning]);


  const markdownChangedHandler = useCallback((value: string, isClean: boolean): void => {
    setMarkdownWithDebounce(value, isClean);
  }, [setMarkdownWithDebounce]);

  // return true if the save succeeds, otherwise false.
  const save = useCallback(async(opts?: {overwriteScopesOfDescendants: boolean}): Promise<boolean> => {
    if (grantData == null || isSlackEnabled == null || currentPathname == null) {
      logger.error('Some materials to save are invalid', { grantData, isSlackEnabled, currentPathname });
      throw new Error('Some materials to save are invalid');
    }

    const grant = grantData.grant || PageGrant.GRANT_PUBLIC;
    const grantedGroup = grantData?.grantedGroup;

    const optionsToSave = Object.assign(
      getOptionsToSave(isSlackEnabled, slackChannels, grant || 1, grantedGroup?.id, grantedGroup?.name, pageTags || []),
      { ...opts },
    );

    try {
      await saveOrUpdate(optionsToSave, { pageId, path: currentPagePath || currentPathname, revisionId: currentRevisionId }, markdownToSave.current);
      await mutateCurrentPage();
      mutateIsEnabledUnsavedWarning(false);
      return true;
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error);
      if (error.code === 'conflict') {
        // pageContainer.setState({
        //   remoteRevisionId: error.data.revisionId,
        //   remoteRevisionBody: error.data.revisionBody,
        //   remoteRevisionUpdateAt: error.data.createdAt,
        //   lastUpdateUser: error.data.user,
        // });
      }
      return false;
    }

  // eslint-disable-next-line max-len
  }, [grantData, isSlackEnabled, currentPathname, slackChannels, pageTags, pageId, currentPagePath, currentRevisionId, mutateCurrentPage, mutateIsEnabledUnsavedWarning]);

  const saveAndReturnToViewHandler = useCallback(async(opts?: {overwriteScopesOfDescendants: boolean}) => {
    if (editorMode !== EditorMode.Editor) {
      return;
    }

    await save(opts);
    mutateEditorMode(EditorMode.View);
  }, [editorMode, save, mutateEditorMode]);

  const saveWithShortcut = useCallback(async() => {
    if (editorMode !== EditorMode.Editor) {
      return;
    }

    const isSuccess = await save();
    if (isSuccess) {
      toastSuccess(t('toaster.save_succeeded'));
    }

  }, [editorMode, save, t]);


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
        globalEmitter.emit('resetInitializedHackMdStatus');
        mutateGrant(res.page.grant);
      }
    }
    catch (e) {
      logger.error('failed to upload', e);
      toastError(e);
    }
    finally {
      editorRef.current.terminateUploadingState();
    }
  }, [currentPagePath, mutateGrant, pageId]);


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


  // initialize
  useEffect(() => {
    if (initialValue == null) {
      return;
    }
    markdownToSave.current = initialValue;
    setMarkdownToPreview(initialValue);
    mutateIsEnabledUnsavedWarning(false);
  }, [initialValue, mutateIsEnabledUnsavedWarning]);

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

  // set handler to save and return to View
  useEffect(() => {
    globalEmitter.on('saveAndReturnToView', saveAndReturnToViewHandler);

    return function cleanup() {
      globalEmitter.removeListener('saveAndReturnToView', saveAndReturnToViewHandler);
    };
  }, [saveAndReturnToViewHandler]);

  // set handler to focus
  useEffect(() => {
    if (editorRef.current != null && editorMode === EditorMode.Editor) {
      editorRef.current.forceToFocus();
    }
  }, [editorMode]);

  // Unnecessary code. Delete after PageEditor and PageEditorByHackmd implementation has completed. -- 2022.09.06 Yuki Takei
  //
  // set handler to update editor value
  // useEffect(() => {
  //   const handler = (markdown) => {
  //     if (editorRef.current != null) {
  //       editorRef.current.setValue(markdown);
  //     }
  //   };
  //   globalEmitter.on('updateEditorValue', handler);

  //   return function cleanup() {
  //     globalEmitter.removeListener('updateEditorValue', handler);
  //   };
  // }, []);

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
          value={initialValue}
          isUploadable={isUploadable}
          isUploadableFile={isUploadableFile}
          isTextlintEnabled={isTextlintEnabled}
          indentSize={indentSize}
          onScroll={editorScrolledHandler}
          onScrollCursorIntoView={editorScrollCursorIntoViewHandler}
          onChange={markdownChangedHandler}
          onUpload={uploadHandler}
          onSave={saveWithShortcut}
        />
      </div>
      <div className="d-none d-lg-block page-editor-preview-container flex-grow-1 flex-basis-0 mw-0">
        <Preview
          ref={previewRef}
          rendererOptions={rendererOptions}
          markdown={markdownToPreview}
          pagePath={currentPagePath}
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
});
PageEditor.displayName = 'PageEditor';

export default PageEditor;
