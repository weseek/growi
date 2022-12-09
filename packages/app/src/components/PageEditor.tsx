import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';


import EventEmitter from 'events';

import {
  IPageHasId, PageGrant, pathUtils,
} from '@growi/core';
import detectIndent from 'detect-indent';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { throttle, debounce } from 'throttle-debounce';

import { useSaveOrUpdate } from '~/client/services/page-operation';
import { apiGet, apiPostForm } from '~/client/util/apiv1-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { IEditorMethods } from '~/interfaces/editor-methods';
import { OptionsToSave } from '~/interfaces/page-operation';
import { SocketEventName } from '~/interfaces/websocket';
import {
  useCurrentPathname, useCurrentPageId, useIsEnabledAttachTitleHeader, useTemplateBodyData,
  useIsEditable, useIsUploadableFile, useIsUploadableImage, useIsNotFound, useIsIndentSizeForced,
} from '~/stores/context';
import {
  useCurrentIndentSize, useSWRxSlackChannels, useIsSlackEnabled, useIsTextlintEnabled, usePageTagsForEditors,
  useIsEnabledUnsavedWarning,
  useIsConflict,
  useEditingMarkdown,
} from '~/stores/editor';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPagePath, useSWRxCurrentPage } from '~/stores/page';
import { usePreviewOptions } from '~/stores/renderer';
import {
  EditorMode,
  useEditorMode, useSelectedGrant,
} from '~/stores/ui';
import { useGlobalSocket } from '~/stores/websocket';
import { registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';


// import { ConflictDiffModal } from './PageEditor/ConflictDiffModal';
import { ConflictDiffModal } from './PageEditor/ConflictDiffModal';
import Editor from './PageEditor/Editor';
import Preview from './PageEditor/Preview';
import scrollSyncHelper from './PageEditor/ScrollSyncHelper';


const logger = loggerFactory('growi:PageEditor');


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}


// for scrolling
let lastScrolledDateWithCursor: Date | null = null;
let isOriginOfScrollSyncEditor = false;
let isOriginOfScrollSyncPreview = false;

const PageEditor = React.memo((): JSX.Element => {

  const { t } = useTranslation();
  const router = useRouter();

  const { data: isNotFound } = useIsNotFound();
  const { data: pageId, mutate: mutateCurrentPageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPathname } = useCurrentPathname();
  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: pageTags } = usePageTagsForEditors(pageId);
  const { data: editingMarkdown } = useEditingMarkdown();
  const { data: isEnabledAttachTitleHeader } = useIsEnabledAttachTitleHeader();
  const { data: templateBodyData } = useTemplateBodyData();
  const { data: isEditable } = useIsEditable();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isTextlintEnabled } = useIsTextlintEnabled();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();
  const { data: currentIndentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();
  const { data: isUploadableFile } = useIsUploadableFile();
  const { data: isUploadableImage } = useIsUploadableImage();
  const { data: conflictDiffModalStatus, close: closeConflictDiffModal } = useConflictDiffModal();

  const { data: rendererOptions, mutate: mutateRendererOptions } = usePreviewOptions();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const saveOrUpdate = useSaveOrUpdate();

  const currentRevisionId = currentPage?.revision?._id;

  const initialValue = useMemo(() => {
    if (!isNotFound) {
      return editingMarkdown ?? '';
    }

    let initialValue = '';
    if (isEnabledAttachTitleHeader && currentPathname != null) {
      initialValue += `${pathUtils.attachTitleHeader(currentPathname)}\n`;
    }
    if (templateBodyData != null) {
      initialValue += `${templateBodyData}\n`;
    }
    return initialValue;

  }, [isNotFound, currentPathname, editingMarkdown, isEnabledAttachTitleHeader, templateBodyData]);

  const markdownToSave = useRef<string>(initialValue);
  const [markdownToPreview, setMarkdownToPreview] = useState<string>(initialValue);

  const slackChannels = useMemo(() => (slackChannelsData ? slackChannelsData.toString() : ''), [slackChannelsData]);

  const { data: socket } = useGlobalSocket();

  const { mutate: mutateIsConflict } = useIsConflict();


  const editorRef = useRef<IEditorMethods>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const checkIsConflict = useCallback((data) => {
    const { s2cMessagePageUpdated } = data;

    const isConflict = markdownToPreview !== s2cMessagePageUpdated.revisionBody;

    mutateIsConflict(isConflict);

  }, [markdownToPreview, mutateIsConflict]);

  useEffect(() => {
    markdownToSave.current = initialValue;
    setMarkdownToPreview(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, checkIsConflict);

    return () => {
      socket.off(SocketEventName.PageUpdated, checkIsConflict);
    };

  }, [socket, checkIsConflict]);

  // const optionsToSave = useMemo(() => {
  //   if (grantData == null) {
  //     return;
  //   }
  //   const slackChannels = slackChannelsData ? slackChannelsData.toString() : '';
  //   const optionsToSave = getOptionsToSave(
  //     isSlackEnabled ?? false, slackChannels,
  //     grantData.grant, grantData.grantedGroup?.id, grantData.grantedGroup?.name,
  //     pageTags || [],
  //   );
  //   return optionsToSave;
  // }, [grantData, isSlackEnabled, pageTags, slackChannelsData]);
  // register to facade
  useEffect(() => {
    // for markdownRenderer
    registerGrowiFacade({
      markdownRenderer: {
        optionsMutators: {
          previewOptionsMutator: mutateRendererOptions,
        },
      },
    });
  }, [mutateRendererOptions]);

  const setMarkdownWithDebounce = useMemo(() => debounce(100, throttle(150, (value: string, isClean: boolean) => {
    markdownToSave.current = value;
    setMarkdownToPreview(value);

    // Displays an unsaved warning alert
    mutateIsEnabledUnsavedWarning(!isClean);
  })), [mutateIsEnabledUnsavedWarning]);


  const markdownChangedHandler = useCallback((value: string, isClean: boolean): void => {
    setMarkdownWithDebounce(value, isClean);
  }, [setMarkdownWithDebounce]);

  const save = useCallback(async(opts?: {overwriteScopesOfDescendants: boolean}): Promise<IPageHasId | null> => {
    if (grantData == null || isSlackEnabled == null || currentPathname == null) {
      logger.error('Some materials to save are invalid', { grantData, isSlackEnabled, currentPathname });
      throw new Error('Some materials to save are invalid');
    }

    const grant = grantData.grant || PageGrant.GRANT_PUBLIC;
    const grantedGroup = grantData?.grantedGroup;

    const optionsToSave: OptionsToSave = {
      isSlackEnabled,
      slackChannels,
      grant: grant || 1,
      pageTags: pageTags || [],
      grantUserGroupId: grantedGroup?.id,
      grantUserGroupName: grantedGroup?.name,
      ...opts,
    };

    try {
      const { page } = await saveOrUpdate(
        markdownToSave.current,
        { pageId, path: currentPagePath || currentPathname, revisionId: currentRevisionId },
        optionsToSave,
      );

      return page;
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
      return null;
    }

  // eslint-disable-next-line max-len
  }, [grantData, isSlackEnabled, currentPathname, slackChannels, pageTags, saveOrUpdate, pageId, currentPagePath, currentRevisionId]);

  const saveAndReturnToViewHandler = useCallback(async(opts?: {overwriteScopesOfDescendants: boolean}) => {
    if (editorMode !== EditorMode.Editor) {
      return;
    }

    const page = await save(opts);
    if (page == null) {
      return;
    }

    if (isNotFound) {
      await router.push(`/${page._id}`);
    }
    else {
      await mutateCurrentPageId(page._id);
      await mutateCurrentPage();
    }
    mutateEditorMode(EditorMode.View);
  }, [editorMode, save, isNotFound, mutateEditorMode, router, mutateCurrentPageId, mutateCurrentPage]);

  const saveWithShortcut = useCallback(async() => {
    if (editorMode !== EditorMode.Editor) {
      return;
    }

    const page = await save();
    if (page != null) {
      toastSuccess(t('toaster.save_succeeded'));
      await mutateCurrentPageId(page._id);
      await mutateCurrentPage();
    }
  }, [editorMode, mutateCurrentPage, mutateCurrentPageId, save, t]);


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

  // Detect indent size from contents (only when users are allowed to change it)
  useEffect(() => {
    // do nothing if the indent size fixed
    if (isIndentSizeForced == null || isIndentSizeForced) {
      return;
    }

    // detect from markdown
    if (initialValue != null) {
      const detectedIndent = detectIndent(initialValue);
      if (detectedIndent.type === 'space' && new Set([2, 4]).has(detectedIndent.amount)) {
        mutateCurrentIndentSize(detectedIndent.amount);
      }
    }
  }, [initialValue, isIndentSizeForced, mutateCurrentIndentSize]);

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
          indentSize={currentIndentSize}
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
      <ConflictDiffModal
        isOpen={conflictDiffModalStatus?.isOpened}
        onClose={() => closeConflictDiffModal()}
        markdownOnEdit={markdownToPreview}
        optionsToSave={undefined} // replace undefined
      />
    </div>
  );
});
PageEditor.displayName = 'PageEditor';

export default PageEditor;
