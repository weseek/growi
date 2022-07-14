import React, {
  useCallback, useEffect, useMemo, useState, SyntheticEvent, RefObject,
} from 'react';


import AppContainer from '~/client/services/AppContainer';
import InterceptorManager from '~/services/interceptor-manager';
import { RendererOptions } from '~/services/renderer/renderer';
import { useEditorSettings } from '~/stores/editor';

import RevisionBody from '../Page/RevisionBody';
import { withUnstatedContainers } from '../UnstatedUtils';


declare const interceptorManager: InterceptorManager;


type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string,
  renderMathJaxOnInit?: boolean,
  onScroll?: (scrollTop: number) => void,
}

type UnstatedProps = Props & { appContainer: AppContainer };

const Preview = React.forwardRef((props: UnstatedProps, ref: RefObject<HTMLDivElement>): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath,
  } = props;

  const [html, setHtml] = useState('');

  const { data: editorSettings } = useEditorSettings();

  const context = useMemo(() => {
    return {
      markdown,
      pagePath,
      renderDrawioInRealtime: editorSettings?.renderDrawioInRealtime,
      currentPathname: decodeURIComponent(window.location.pathname),
      parsedHTML: null,
    };
  }, [markdown, pagePath, editorSettings?.renderDrawioInRealtime]);

  const renderPreview = useCallback(async() => {
    if (interceptorManager != null) {
      await interceptorManager.process('preRenderPreview', context);
      await interceptorManager.process('prePreProcess', context);
      context.markdown = rendererOptions.preProcess(context.markdown, context);
      await interceptorManager.process('postPreProcess', context);
      context.parsedHTML = rendererOptions.process(context.markdown, context);
      await interceptorManager.process('prePostProcess', context);
      context.parsedHTML = rendererOptions.postProcess(context.parsedHTML, context);
      await interceptorManager.process('postPostProcess', context);
      await interceptorManager.process('preRenderPreviewHtml', context);
    }

    setHtml(context.parsedHTML ?? '');
  }, [context, rendererOptions]);

  useEffect(() => {
    if (markdown == null) {
      setHtml('');
    }

    renderPreview();
  }, [markdown, renderPreview]);

  useEffect(() => {
    if (html == null) {
      return;
    }

    if (interceptorManager != null) {
      interceptorManager.process('postRenderPreviewHtml', {
        ...context,
        parsedHTML: html,
      });
    }
  }, [context, html]);

  return (
    <div
      className="page-editor-preview-body"
      ref={ref}
      onScroll={(event: SyntheticEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          props.onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      <RevisionBody
        {...props}
        html={html}
        renderMathJaxInRealtime={editorSettings?.renderMathJaxInRealtime}
      />
    </div>
  );

});

Preview.displayName = 'Preview';

/**
 * Wrapper component for using unstated
 */
const PreviewWrapper = withUnstatedContainers(Preview, [AppContainer]);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PreviewWrapper2 = React.forwardRef((props: Props, ref: RefObject<HTMLDivElement>): JSX.Element => {
  return <PreviewWrapper ref={ref} {...props} />;
});

PreviewWrapper2.displayName = 'PreviewWrapper2';

export default PreviewWrapper2;
