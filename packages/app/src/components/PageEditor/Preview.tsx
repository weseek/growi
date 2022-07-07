import React, {
  useCallback, useEffect, useMemo, useState, SyntheticEvent,
} from 'react';


import AppContainer from '~/client/services/AppContainer';
import GrowiRenderer from '~/client/util/GrowiRenderer';
import InterceptorManager from '~/services/interceptor-manager';
import { useEditorSettings } from '~/stores/editor';
import { usePreviewRenderer } from '~/stores/renderer';

import RevisionBody from '../Page/RevisionBody';
import { withUnstatedContainers } from '../UnstatedUtils';


declare const interceptorManager: InterceptorManager;


type Props = {
  appContainer: AppContainer,
  growiRenderer: GrowiRenderer,
  markdown?: string,
  pagePath?: string,
  inputRef?: React.RefObject<HTMLDivElement>,
  isMathJaxEnabled?: boolean,
  renderMathJaxOnInit?: boolean,
  onScroll?: (scrollTop: number) => void,
}


const Preview = (props: Props): JSX.Element => {

  const {
    appContainer, growiRenderer,
    markdown, pagePath,
    inputRef,
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
      context.markdown = growiRenderer.preProcess(context.markdown, context);
      await interceptorManager.process('postPreProcess', context);
      context.parsedHTML = growiRenderer.process(context.markdown, context);
      await interceptorManager.process('prePostProcess', context);
      context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context);
      await interceptorManager.process('postPostProcess', context);
      await interceptorManager.process('preRenderPreviewHtml', context);
    }

    setHtml(context.parsedHTML ?? '');
  }, [interceptorManager, context, growiRenderer]);

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
  }, [context, html, interceptorManager]);

  return (
    <div
      className="page-editor-preview-body"
      ref={inputRef}
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

};

/**
 * Wrapper component for using unstated
 */
const PreviewWrapper = withUnstatedContainers(Preview, [AppContainer]);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PreviewWrapper2 = (props): JSX.Element => {
  const { data: growiRenderer } = usePreviewRenderer();
  if (growiRenderer == null) {
    return <></>;
  }

  return <PreviewWrapper growiRenderer={growiRenderer} {...props} />;
};

export default PreviewWrapper2;
