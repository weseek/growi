import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import AppContainer from '~/client/services/AppContainer';
import { blinkElem } from '~/client/util/blink-section-header';
import { addSmoothScrollEvent } from '~/client/util/smooth-scroll';
import { CustomWindow } from '~/interfaces/global';
import GrowiRenderer from '~/services/renderer/growi-renderer';
import { useEditorSettings } from '~/stores/editor';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../UnstatedUtils';

import RevisionBody from './RevisionBody';


const logger = loggerFactory('components:Page:RevisionRenderer');


function getHighlightedBody(body: string, _keywords: string | string[]): string {
  const normalizedKeywordsArray: string[] = [];

  const keywords = (typeof _keywords === 'string') ? [_keywords] : _keywords;

  if (keywords.length === 0) {
    return body;
  }

  // !!TODO!!: add test code refs: https://redmine.weseek.co.jp/issues/86841
  // Separate keywords
  // - Surrounded by double quotation
  // - Split by both full-width and half-width spaces
  // [...keywords.match(/"[^"]+"|[^\u{20}\u{3000}]+/ug)].forEach((keyword, i) => {
  keywords.forEach((keyword, i) => {
    if (keyword === '') {
      return;
    }
    const k = keyword
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex operators
      .replace(/(^"|"$)/g, ''); // for phrase (quoted) keyword
    normalizedKeywordsArray.push(k);
  });

  const normalizedKeywords = `(${normalizedKeywordsArray.join('|')})`;
  const keywordRegxp = new RegExp(`${normalizedKeywords}(?!(.*?"))`, 'ig'); // prior https://regex101.com/r/oX7dq5/1
  let keywordRegexp2 = keywordRegxp;

  // for non-chrome browsers compatibility
  try {
    // eslint-disable-next-line regex/invalid
    keywordRegexp2 = new RegExp(`(?<!<)${normalizedKeywords}(?!(.*?("|>)))`, 'ig'); // inferior (this doesn't work well when html tags exist a lot) https://regex101.com/r/Dfi61F/1
  }
  catch (err) {
    logger.debug('Failed to initialize regex:', err);
  }

  const highlighter = (str) => { return str.replace(keywordRegxp, '<em class="highlighted-keyword">$&</em>') }; // prior
  const highlighter2 = (str) => { return str.replace(keywordRegexp2, '<em class="highlighted-keyword">$&</em>') }; // inferior

  const insideTagRegex = /<[^<>]*>/g;
  const betweenTagRegex = />([^<>]*)</g; // use (group) to ignore >< around

  const insideTagStrs = body.match(insideTagRegex);
  const betweenTagMatches = Array.from(body.matchAll(betweenTagRegex));

  let returnBody = body;
  const isSafeHtml = insideTagStrs?.length === betweenTagMatches.length + 1; // to check whether is safe to join
  if (isSafeHtml) {
    // highlight
    const betweenTagStrs: string[] = betweenTagMatches.map(match => highlighter(match[1])); // get only grouped part (exclude >< around)

    const arr: string[] = [];
    insideTagStrs.forEach((str, i) => {
      arr.push(str);
      arr.push(betweenTagStrs[i]);
    });
    returnBody = arr.join('');
  }
  else {
    // inferior highlighter
    returnBody = highlighter2(body);
  }

  return returnBody;
}


type Props = {
  appContainer: AppContainer,
  growiRenderer: GrowiRenderer,
  markdown: string,
  pagePath: string,
  highlightKeywords?: string | string[],
  additionalClassName?: string,
}

const RevisionRenderer = (props: Props): JSX.Element => {

  const { interceptorManager } = (window as CustomWindow);
  const {
    growiRenderer, markdown, pagePath, highlightKeywords,
  } = props;

  const [html, setHtml] = useState('');

  const { data: editorSettings } = useEditorSettings();

  const currentRenderingContext = useMemo(() => {
    return {
      markdown,
      parsedHTML: '',
      pagePath,
      renderDrawioInRealtime: editorSettings?.renderDrawioInRealtime,
      currentPathname: decodeURIComponent(window.location.pathname),
    };
  }, [editorSettings?.renderDrawioInRealtime, markdown, pagePath]);


  const renderHtml = useCallback(async() => {
    if (interceptorManager == null) {
      return;
    }

    const context = currentRenderingContext;

    await interceptorManager.process('preRender', context);
    await interceptorManager.process('prePreProcess', context);
    context.markdown = growiRenderer.preProcess(context.markdown, context);
    await interceptorManager.process('postPreProcess', context);
    context.parsedHTML = growiRenderer.process(context.markdown, context);
    await interceptorManager.process('prePostProcess', context);
    context.parsedHTML = growiRenderer.postProcess(context.parsedHTML, context);

    const isMarkdownEmpty = context.markdown.trim().length === 0;
    if (highlightKeywords != null && !isMarkdownEmpty) {
      context.parsedHTML = getHighlightedBody(context.parsedHTML, highlightKeywords);
    }
    await interceptorManager.process('postPostProcess', context);
    await interceptorManager.process('preRenderHtml', context);

    setHtml(context.parsedHTML);
  }, [currentRenderingContext, growiRenderer, highlightKeywords, interceptorManager]);

  useEffect(() => {
    if (interceptorManager == null) {
      return;
    }

    renderHtml()
      .then(() => {
        const HeaderLink = document.getElementsByClassName('revision-head-link');
        const HeaderLinkArray = Array.from(HeaderLink);
        addSmoothScrollEvent(HeaderLinkArray as HTMLAnchorElement[], blinkElem);

        interceptorManager.process('postRenderHtml', currentRenderingContext);
      });

  }, [currentRenderingContext, interceptorManager, renderHtml]);

  const config = props.appContainer.getConfig();
  const isMathJaxEnabled = !!config.env.MATHJAX;

  return (
    <RevisionBody
      html={html}
      isMathJaxEnabled={isMathJaxEnabled}
      additionalClassName={props.additionalClassName}
      renderMathJaxOnInit
    />
  );

};

/**
   * Wrapper component for using unstated
   */
const RevisionRendererWrapper = withUnstatedContainers(RevisionRenderer, [AppContainer]);

export default RevisionRendererWrapper;
