import type { CSSProperties } from 'react';
import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';


import type EventEmitter from 'events';
import nodePath from 'path';

import { type IPageHasId, Origin } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import {
  CodeMirrorEditorMain, CodeMirrorEditorMainReadOnly, GlobalCodeMirrorEditorKey,
  useCodeMirrorEditorIsolated, useResolvedThemeForEditor,
} from '@growi/editor';
import { useRect } from '@growi/ui/dist/utils';
import detectIndent from 'detect-indent';
import { useTranslation } from 'next-i18next';
import { throttle, debounce } from 'throttle-debounce';

import { useShouldExpandContent } from '~/client/services/layout';
import { useUpdateStateAfterSave } from '~/client/services/page-operation';
import { updatePage, extractRemoteRevisionDataFromErrorObj } from '~/client/services/update-page';
import { apiv3Get, apiv3PostForm } from '~/client/util/apiv3-client';
import { toastError, toastSuccess, toastWarning } from '~/client/util/toastr';
import {
  useDefaultIndentSize, useCurrentUser,
  useCurrentPathname, useIsEnabledAttachTitleHeader,
  useIsEditable, useIsIndentSizeForced,
  useAcceptedUploadFileType, useIsOldRevisionPage,
} from '~/stores/context';
import {
  useEditorSettings,
  useCurrentIndentSize,
  useEditingMarkdown,
  useWaitingSaveProcessing,
} from '~/stores/editor';
import {
  useCurrentPagePath, useSWRxCurrentPage, useCurrentPageId, useIsNotFound, useTemplateBodyData,
} from '~/stores/page';
import { mutatePageTree } from '~/stores/page-listing';
import { usePreviewOptions } from '~/stores/renderer';
import {
  EditorMode,
  useEditorMode, useSelectedGrant,
} from '~/stores/ui';
import { useEditingUsers } from '~/stores/use-editing-users';
import { useNextThemes } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';

import { EditorNavbar } from './EditorNavbar';
import EditorNavbarBottom from './EditorNavbarBottom';
import Preview from './Preview';
import { scrollEditor, scrollPreview } from './ScrollSyncHelper';
import { useConflictResolver, useConflictEffect, type ConflictHandler } from './conflict';

import '@growi/editor/dist/style.css';


const logger = loggerFactory('growi:PageEditor');


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

// for scrolling
let isOriginOfScrollSyncEditor = false;
let isOriginOfScrollSyncPreview = false;

export type SaveOptions = {
  slackChannels: string,
  overwriteScopesOfDescendants?: boolean
}
export type Save = (
  revisionId?: string,
  requestMarkdown?: string,
  opts?: SaveOptions,
  onConflict?: ConflictHandler
) => Promise<IPageHasId | null>

type Props = {
  visibility?: boolean,
}

export const PageEditor = React.memo((props: Props): JSX.Element => {

  const { t } = useTranslation();

  const previewRef = useRef<HTMLDivElement>(null);
  const [previewRect] = useRect(previewRef);

  const { data: isNotFound } = useIsNotFound();
  const { data: pageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPathname } = useCurrentPathname();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: grantData } = useSelectedGrant();
  const { data: editingMarkdown } = useEditingMarkdown();
  const { data: isEnabledAttachTitleHeader } = useIsEnabledAttachTitleHeader();
  const { data: templateBodyData } = useTemplateBodyData();
  const { data: isEditable } = useIsEditable();
  const { mutate: mutateWaitingSaveProcessing } = useWaitingSaveProcessing();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: isIndentSizeForced } = useIsIndentSizeForced();
  const { data: currentIndentSize, mutate: mutateCurrentIndentSize } = useCurrentIndentSize();
  const { data: defaultIndentSize } = useDefaultIndentSize();
  const { data: acceptedUploadFileType } = useAcceptedUploadFileType();
  const { data: editorSettings } = useEditorSettings();
  const { data: user } = useCurrentUser();
  const { data: isOldRevisionPage } = useIsOldRevisionPage();
  const { onEditorsUpdated } = useEditingUsers();
  const onConflict = useConflictResolver();

  const { data: rendererOptions } = usePreviewOptions();

  const { mutate: mutateResolvedTheme } = useResolvedThemeForEditor();

  const shouldExpandContent = useShouldExpandContent(currentPage);

  const updateStateAfterSave = useUpdateStateAfterSave(pageId, { supressEditingMarkdownMutation: true });

  useConflictEffect();

  const { resolvedTheme } = useNextThemes();
  mutateResolvedTheme({ themeData: resolvedTheme });

  const currentRevisionId = currentPage?.revision?._id;
  const isRevisionIdRequiredForPageUpdate = currentPage?.revision?.origin === undefined;

  const initialValueRef = useRef('');
  const initialValue = useMemo(() => {
    if (!isNotFound) {
      return editingMarkdown ?? '';
    }

    let initialValue = '';
    if (isEnabledAttachTitleHeader && currentPathname != null) {
      const pageTitle = nodePath.basename(currentPathname);
      initialValue += `${pathUtils.attachTitleHeader(pageTitle)}\n`;
    }
    if (templateBodyData != null) {
      initialValue += `${templateBodyData}\n`;
    }

    return initialValue;

  }, [isNotFound, currentPathname, editingMarkdown, isEnabledAttachTitleHeader, templateBodyData]);

  useEffect(() => {
    // set to ref
    initialValueRef.current = initialValue;
  }, [initialValue]);
  const [markdownToPreview, setMarkdownToPreview] = useState<string>(initialValue);
  const setMarkdownPreviewWithDebounce = useMemo(() => debounce(100, throttle(150, (value: string) => {
    setMarkdownToPreview(value);
  })), []);

  useEffect(() => {
    setMarkdownToPreview(initialValue);
  }, [initialValue]);

  const markdownChangedHandler = useCallback((value: string) => {
    setMarkdownPreviewWithDebounce(value);
  }, [setMarkdownPreviewWithDebounce]);


  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  const save: Save = useCallback(async(revisionId, markdown, opts, onConflict) => {
    if (pageId == null || grantData == null) {
      logger.error('Some materials to save are invalid', {
        pageId, grantData,
      });
      throw new Error('Some materials to save are invalid');
    }

    try {
      mutateWaitingSaveProcessing(true);

      const { page } = await updatePage({
        pageId,
        revisionId,
        body: markdown ?? '',
        grant: grantData?.grant,
        origin: Origin.Editor,
        userRelatedGrantUserGroupIds: grantData?.userRelatedGrantedGroups?.map((group) => {
          return { item: group.id, type: group.type };
        }),
        ...(opts ?? {}),
      });

      // to sync revision id with page tree: https://github.com/weseek/growi/pull/7227
      mutatePageTree();

      return page;
    }
    catch (error) {
      logger.error('failed to save', error);

      const remoteRevisionData = extractRemoteRevisionDataFromErrorObj(error);
      if (remoteRevisionData != null) {
        onConflict?.(remoteRevisionData, markdown ?? '', save, opts);
        toastWarning(t('modal_resolve_conflict.conflicts_with_new_body_on_server_side'));
        return null;
      }

      toastError(error);
      return null;
    }
    finally {
      mutateWaitingSaveProcessing(false);
    }
  }, [pageId, grantData, mutateWaitingSaveProcessing, t]);

  const saveAndReturnToViewHandler = useCallback(async(opts: SaveOptions) => {
    const markdown = codeMirrorEditor?.getDoc();
    const revisionId = isRevisionIdRequiredForPageUpdate ? currentRevisionId : undefined;
    const page = await save(revisionId, markdown, opts, onConflict);
    if (page == null) {
      return;
    }

    mutateEditorMode(EditorMode.View);
    updateStateAfterSave?.();
  }, [codeMirrorEditor, currentRevisionId, isRevisionIdRequiredForPageUpdate, mutateEditorMode, onConflict, save, updateStateAfterSave]);

  const saveWithShortcut = useCallback(async() => {
    const markdown = codeMirrorEditor?.getDoc();
    const revisionId = isRevisionIdRequiredForPageUpdate ? currentRevisionId : undefined;
    const page = await save(revisionId, markdown, undefined, onConflict);
    if (page == null) {
      return;
    }

    toastSuccess(t('toaster.save_succeeded'));
    updateStateAfterSave?.();
  }, [codeMirrorEditor, currentRevisionId, isRevisionIdRequiredForPageUpdate, onConflict, save, t, updateStateAfterSave]);


  // the upload event handler
  const uploadHandler = useCallback((files: File[]) => {
    files.forEach(async(file) => {
      try {
        const { data: resLimit } = await apiv3Get('/attachment/limit', { fileSize: file.size });

        if (!resLimit.isUploadable) {
          throw new Error(resLimit.errorMessage);
        }

        const formData = new FormData();
        formData.append('file', file);
        if (pageId != null) {
          formData.append('page_id', pageId);
        }

        const { data: resAdd } = await apiv3PostForm('/attachment', formData);

        const attachment = resAdd.attachment;
        const fileName = attachment.originalName;

        let insertText = `[${fileName}](${attachment.filePathProxied})\n`;
        // when image
        if (attachment.fileFormat.startsWith('image/')) {
          // modify to "![fileName](url)" syntax
          insertText = `!${insertText}`;
        }

        codeMirrorEditor?.insertText(insertText);
      }
      catch (e) {
        logger.error('failed to upload', e);
        toastError(e);
      }
    });

  }, [codeMirrorEditor, pageId]);

  const scrollEditorHandler = useCallback(() => {
    if (codeMirrorEditor?.view?.scrollDOM == null || previewRef.current == null) {
      return;
    }

    if (isOriginOfScrollSyncPreview) {
      isOriginOfScrollSyncPreview = false;
      return;
    }

    isOriginOfScrollSyncEditor = true;
    scrollEditor(codeMirrorEditor.view.scrollDOM, previewRef.current);
  }, [codeMirrorEditor]);

  const scrollEditorHandlerThrottle = useMemo(() => throttle(25, scrollEditorHandler), [scrollEditorHandler]);

  const scrollPreviewHandler = useCallback(() => {
    if (codeMirrorEditor?.view?.scrollDOM == null || previewRef.current == null) {
      return;
    }

    if (isOriginOfScrollSyncEditor) {
      isOriginOfScrollSyncEditor = false;
      return;
    }

    isOriginOfScrollSyncPreview = true;
    scrollPreview(codeMirrorEditor.view.scrollDOM, previewRef.current);
  }, [codeMirrorEditor]);

  const scrollPreviewHandlerThrottle = useMemo(() => throttle(25, scrollPreviewHandler), [scrollPreviewHandler]);

  // initial caret line
  useEffect(() => {
    codeMirrorEditor?.setCaretLine();
  }, [codeMirrorEditor]);

  // set handler to save and return to View
  useEffect(() => {
    globalEmitter.on('saveAndReturnToView', saveAndReturnToViewHandler);

    return function cleanup() {
      globalEmitter.removeListener('saveAndReturnToView', saveAndReturnToViewHandler);
    };
  }, [saveAndReturnToViewHandler]);

  // set handler to focus
  useLayoutEffect(() => {
    if (editorMode === EditorMode.Editor) {
      codeMirrorEditor?.focus();
    }
  }, [codeMirrorEditor, editorMode]);

  // Detect indent size from contents (only when users are allowed to change it)
  useEffect(() => {
    // do nothing if the indent size fixed
    if (isIndentSizeForced == null || isIndentSizeForced) {
      mutateCurrentIndentSize(undefined);
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

  // set handler to set caret line
  useEffect(() => {
    const handler = (lineNumber?: number) => {
      codeMirrorEditor?.setCaretLine(lineNumber);

      // TODO: scroll to the caret line
    };
    globalEmitter.on('setCaretLine', handler);

    return function cleanup() {
      globalEmitter.removeListener('setCaretLine', handler);
    };
  }, [codeMirrorEditor]);

  // TODO: Check the reproduction conditions that made this code necessary and confirm reproduction
  // // when transitioning to a different page, if the initialValue is the same,
  // // UnControlled CodeMirror value does not reset, so explicitly set the value to initialValue
  // const onRouterChangeComplete = useCallback(() => {
  //   codeMirrorEditor?.initDoc(ydoc?.getText('codemirror').toString());
  //   codeMirrorEditor?.setCaretLine();
  // }, [codeMirrorEditor, ydoc]);

  // useEffect(() => {
  //   router.events.on('routeChangeComplete', onRouterChangeComplete);
  //   return () => {
  //     router.events.off('routeChangeComplete', onRouterChangeComplete);
  //   };
  // }, [onRouterChangeComplete, router.events]);

  const pastEndStyle: CSSProperties | undefined = useMemo(() => {
    if (previewRect == null) {
      return undefined;
    }

    const previewRectHeight = previewRect.height;

    // containerHeight - 1.5 line height
    return { paddingBottom: `calc(${previewRectHeight}px - 2em)` };
  }, [previewRect]);

  if (!isEditable) {
    return <></>;
  }

  if (rendererOptions == null) {
    return <></>;
  }

  return (
    <div data-testid="page-editor" id="page-editor" className={`flex-expand-vert ${props.visibility ? '' : 'd-none'}`}>

      <EditorNavbar />

      <div className={`flex-expand-horiz ${props.visibility ? '' : 'd-none'}`}>
        <div className="page-editor-editor-container flex-expand-vert border-end">
          { !isOldRevisionPage
            ? (
              <CodeMirrorEditorMain
                onChange={markdownChangedHandler}
                onSave={saveWithShortcut}
                onUpload={uploadHandler}
                acceptedUploadFileType={acceptedUploadFileType}
                onScroll={scrollEditorHandlerThrottle}
                indentSize={currentIndentSize ?? defaultIndentSize}
                user={user ?? undefined}
                pageId={pageId ?? undefined}
                initialValue={initialValue}
                editorSettings={editorSettings}
                onEditorsUpdated={onEditorsUpdated}
              />
            )
            : (
              <CodeMirrorEditorMainReadOnly
                body={initialValue}
              />
            )
          }
        </div>
        <div
          ref={previewRef}
          onScroll={scrollPreviewHandlerThrottle}
          className="page-editor-preview-container flex-expand-vert overflow-y-auto d-none d-lg-flex"
        >
          <Preview
            rendererOptions={rendererOptions}
            markdown={markdownToPreview}
            pagePath={currentPagePath}
            expandContentWidth={shouldExpandContent}
            style={pastEndStyle}
          />
        </div>
      </div>

      { !isOldRevisionPage && (<EditorNavbarBottom />) }

    </div>
  );
});
PageEditor.displayName = 'PageEditor';
