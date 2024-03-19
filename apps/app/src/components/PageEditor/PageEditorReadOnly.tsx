import react, {
  useCallback, useMemo, useRef, type CSSProperties,
} from 'react';

import { CodeMirrorEditorMainReadOnly, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated } from '@growi/editor';
import { useRect } from '@growi/ui/dist/utils';
import { throttle } from 'throttle-debounce';

import { useShouldExpandContent } from '~/client/services/layout';
import { useIsOldRevisionPage } from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { usePreviewOptions } from '~/stores/renderer';

import { EditorNavbar } from './EditorNavbar';
import Preview from './Preview';
import { scrollEditor, scrollPreview } from './ScrollSyncHelper';

let isOriginOfScrollSyncEditor = false;
let isOriginOfScrollSyncPreview = false;

export const PageEditorReadOnly = react.memo((): JSX.Element => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewRect] = useRect(previewRef);

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: rendererOptions } = usePreviewOptions();
  const { data: editingMarkdown } = useEditingMarkdown();
  const { data: isOldRevisionPage } = useIsOldRevisionPage();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.MAIN);

  const shouldExpandContent = useShouldExpandContent(currentPage);

  const pastEndStyle: CSSProperties | undefined = useMemo(() => {
    if (previewRect == null) {
      return undefined;
    }

    const previewRectHeight = previewRect.height;

    // containerHeight - 1.5 line height
    return { paddingBottom: `calc(${previewRectHeight}px - 2em)` };
  }, [previewRect]);

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

  if (rendererOptions == null || !isOldRevisionPage) {
    return <></>;
  }

  return (
    <div data-testid="page-editor" id="page-editor" className="flex-expand-vert">
      <EditorNavbar />

      <div className="flex-expand-horiz">
        <div className="page-editor-editor-container flex-expand-vert border-end">
          <CodeMirrorEditorMainReadOnly
            body={editingMarkdown}
            onScroll={scrollEditorHandlerThrottle}
          />
        </div>
        <div
          ref={previewRef}
          onScroll={scrollPreviewHandlerThrottle}
          className="page-editor-preview-container flex-expand-vert overflow-y-auto d-none d-lg-flex"
        >
          <Preview
            rendererOptions={rendererOptions}
            markdown={editingMarkdown}
            pagePath={currentPage?.path}
            expandContentWidth={shouldExpandContent}
            style={pastEndStyle}
          />
        </div>
      </div>
    </div>
  );
});
