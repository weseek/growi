import React from 'react';

import ReactMarkdown from 'react-markdown';

import { RendererOptions } from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('components:Page:RevisionRenderer');


type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  additionalClassName?: string,
}

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName,
  } = props;

  return (
    <ReactMarkdown
      data-testid="wiki"
      {...rendererOptions}
      className={`wiki ${additionalClassName ?? ''}`}
    >
      {markdown}
    </ReactMarkdown>
  );

  // const [html, setHtml] = useState('');

  // const { data: interceptorManager } = useInterceptorManager();
  // const { data: editorSettings } = useEditorSettings();
  // const { data: currentPathname } = useCurrentPathname();

  // const currentRenderingContext = useMemo(() => {
  //   return {
  //     markdown,
  //     parsedHTML: '',
  //     pagePath,
  //     renderDrawioInRealtime: editorSettings?.renderDrawioInRealtime,
  //     currentPathname: decodeURIComponent(currentPathname ?? '/'),
  //   };
  // }, [editorSettings?.renderDrawioInRealtime, markdown, pagePath]);


  // const renderHtml = useCallback(async() => {
  //   if (interceptorManager == null) {
  //     return;
  //   }

  //   const context = currentRenderingContext;

  //   await interceptorManager.process('preRender', context);
  //   await interceptorManager.process('prePreProcess', context);
  //   context.markdown = growiRenderer.preProcess(context.markdown, context);
  //   await interceptorManager.process('postPreProcess', context);
  //   context.parsedHTML = growiRenderer.process(context.markdown, context);
  //   await interceptorManager.process('prePostProcess', context);
  //   context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context);

  //   const isMarkdownEmpty = context.markdown.trim().length === 0;
  //   if (highlightKeywords != null && !isMarkdownEmpty) {
  //     context.parsedHTML = getHighlightedBody(context.parsedHTML, highlightKeywords);
  //   }
  //   await interceptorManager.process('postPostProcess', context);
  //   await interceptorManager.process('preRenderHtml', context);

  //   setHtml(context.parsedHTML);
  // }, [currentRenderingContext, growiRenderer, highlightKeywords, interceptorManager]);

  // useEffect(() => {
  //   if (interceptorManager == null) {
  //     return;
  //   }

  //   renderHtml()
  //     .then(() => {
  //       // const HeaderLink = document.getElementsByClassName('revision-head-link');
  //       // const HeaderLinkArray = Array.from(HeaderLink);
  //       // addSmoothScrollEvent(HeaderLinkArray as HTMLAnchorElement[], blinkElem);

  //       // interceptorManager.process('postRenderHtml', currentRenderingContext);
  //     });

  // }, [currentRenderingContext, interceptorManager, renderHtml]);

  // const config = props.appContainer.getConfig();
  // const isMathJaxEnabled = !!config.env.MATHJAX;

  // return (
  //   <RevisionBody
  //     html={html}
  //     isMathJaxEnabled={isMathJaxEnabled}
  //     additionalClassName={props.additionalClassName}
  //     renderMathJaxOnInit
  //   />
  // );

  // const [html, setHtml] = useState('');

  // const { data: interceptorManager } = useInterceptorManager();
  // const { data: editorSettings } = useEditorSettings();
  // const { data: currentPathname } = useCurrentPathname();

  // const currentRenderingContext = useMemo(() => {
  //   return {
  //     markdown,
  //     parsedHTML: '',
  //     pagePath,
  //     renderDrawioInRealtime: editorSettings?.renderDrawioInRealtime,
  //     currentPathname: decodeURIComponent(currentPathname ?? '/'),
  //   };
  // }, [editorSettings?.renderDrawioInRealtime, markdown, pagePath]);


  // const renderHtml = useCallback(async() => {
  //   if (interceptorManager == null) {
  //     return;
  //   }

  //   const context = currentRenderingContext;

  //   await interceptorManager.process('preRender', context);
  //   await interceptorManager.process('prePreProcess', context);
  //   context.markdown = growiRenderer.preProcess(context.markdown, context);
  //   await interceptorManager.process('postPreProcess', context);
  //   context.parsedHTML = growiRenderer.process(context.markdown, context);
  //   await interceptorManager.process('prePostProcess', context);
  //   context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context);

  //   const isMarkdownEmpty = context.markdown.trim().length === 0;
  //   if (highlightKeywords != null && !isMarkdownEmpty) {
  //     context.parsedHTML = getHighlightedBody(context.parsedHTML, highlightKeywords);
  //   }
  //   await interceptorManager.process('postPostProcess', context);
  //   await interceptorManager.process('preRenderHtml', context);

  //   setHtml(context.parsedHTML);
  // }, [currentRenderingContext, growiRenderer, highlightKeywords, interceptorManager]);

  // useEffect(() => {
  //   if (interceptorManager == null) {
  //     return;
  //   }

  //   renderHtml()
  //     .then(() => {
  //       // const HeaderLink = document.getElementsByClassName('revision-head-link');
  //       // const HeaderLinkArray = Array.from(HeaderLink);
  //       // addSmoothScrollEvent(HeaderLinkArray as HTMLAnchorElement[], blinkElem);

  //       // interceptorManager.process('postRenderHtml', currentRenderingContext);
  //     });

  // }, [currentRenderingContext, interceptorManager, renderHtml]);

  // return (
  //   <RevisionBody
  //     html={html}
  //     additionalClassName={props.additionalClassName}
  //     renderMathJaxOnInit
  //   />
  // );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
