import {
  type ReactNode, useRef, useMemo, RefObject,
} from 'react';

import { useRenderedObserver } from '@growi/ui/dist/utils';
import getXPath from 'get-xpath';

import loggerFactory from '~/utils/logger';

import { useSWRxInlineComment } from '../../stores';

import { InlineComment } from './InlineComment';


const logger = loggerFactory('growi:components:InlineCommentsContainer');


const findWikiElement = (containerRef: RefObject<Element>): Element | undefined => {
  const wikiElements = containerRef.current?.getElementsByClassName('wiki');

  if (wikiElements == null || wikiElements.length === 0) {
    return;
  }
  if (wikiElements.length !== 1) {
    logger.error("Could not identify target wiki element. Multiple element that has '.wiki' class has found.");
    return;
  }

  return wikiElements[0];
};

export const InlineCommentsContainer = ({ children }: { children?: ReactNode }): JSX.Element => {

  const { data: inlineComments } = useSWRxInlineComment();

  const containerRef = useRef<HTMLDivElement>(null);

  // create InlineComment components after the container element has rendered
  const { isRendering } = useRenderedObserver(containerRef);
  const inlineCommentComponents = useMemo(() => {
    if (isRendering !== false) return <></>;

    const wikiElement = findWikiElement(containerRef);

    if (wikiElement == null) {
      return <></>;
    }

    const wikiElementXpath = getXPath(wikiElement);
    return (inlineComments ?? []).map((inlineComment) => {
      console.log('render InlineComment');
      return <InlineComment key={inlineComment._id} inlineComment={inlineComment} wikiElementXpath={wikiElementXpath} />;
    });
  }, [inlineComments, isRendering]);

  return (
    <>
      <div ref={containerRef}>
        {children}
      </div>
      {inlineCommentComponents}
    </>
  );
};
