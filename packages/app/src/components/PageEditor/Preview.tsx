import React, {
  UIEventHandler, useCallback, useEffect, useMemo, useState,
} from 'react';


import AppContainer from '~/client/services/AppContainer';
import { useEditorSettings } from '~/stores/editor';

import RevisionBody from '../Page/RevisionBody';
import { withUnstatedContainers } from '../UnstatedUtils';


type Props = {
  appContainer: AppContainer,

  markdown?: string,
  pagePath?: string,
  inputRef?: React.RefObject<HTMLDivElement>,
  isMathJaxEnabled?: boolean,
  renderMathJaxOnInit?: boolean,
  onScroll?: UIEventHandler<HTMLDivElement>,
}


const Preview = (props: Props): JSX.Element => {

  const {
    appContainer,
    markdown, pagePath,
    inputRef,
    onScroll,
  } = props;

  const [html, setHtml] = useState('');

  const { data: editorSettings } = useEditorSettings();

  const { interceptorManager } = appContainer;
  const growiRenderer = props.appContainer.getRenderer('editor');

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
      onScroll={onScroll}
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

export default PreviewWrapper;
