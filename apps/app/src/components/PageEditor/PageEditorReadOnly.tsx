import react, { useMemo, useRef, type CSSProperties } from 'react';

import { CodeMirrorEditorReadOnly, GlobalCodeMirrorEditorKey } from '@growi/editor';
import { useRect } from '@growi/ui/dist/utils';
import { throttle } from 'throttle-debounce';

import { useShouldExpandContent } from '~/client/services/layout';
import { useEditingMarkdown } from '~/stores/editor';
import { useSWRxCurrentPage, useIsLatestRevision } from '~/stores/page';
import { usePreviewOptions } from '~/stores/renderer';

import { EditorNavbar } from './EditorNavbar';
import Preview from './Preview';
import { useScrollSync } from './ScrollSyncHelper';

export const PageEditorReadOnly = react.memo((): JSX.Element => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewRect] = useRect(previewRef);

  const { data: currentPage } = useSWRxCurrentPage();
  const { data: rendererOptions } = usePreviewOptions();
  const { data: editingMarkdown } = useEditingMarkdown();
  const { data: isLatestRevision } = useIsLatestRevision();
  const shouldExpandContent = useShouldExpandContent(currentPage);

  const { scrollEditorHandler, scrollPreviewHandler } = useScrollSync(GlobalCodeMirrorEditorKey.READONLY, previewRef);
  const scrollEditorHandlerThrottle = useMemo(() => throttle(25, scrollEditorHandler), [scrollEditorHandler]);
  const scrollPreviewHandlerThrottle = useMemo(() => throttle(25, scrollPreviewHandler), [scrollPreviewHandler]);

  const pastEndStyle: CSSProperties | undefined = useMemo(() => {
    if (previewRect == null) {
      return undefined;
    }

    const previewRectHeight = previewRect.height;

    // containerHeight - 1.5 line height
    return { paddingBottom: `calc(${previewRectHeight}px - 2em)` };
  }, [previewRect]);

  if (rendererOptions == null || isLatestRevision) {
    return <></>;
  }

  return (
    <div data-testid="page-editor" id="page-editor" className="flex-expand-vert">
      <EditorNavbar />

      <div className="flex-expand-horiz">
        <div className="page-editor-editor-container flex-expand-vert border-end">
          <CodeMirrorEditorReadOnly
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
