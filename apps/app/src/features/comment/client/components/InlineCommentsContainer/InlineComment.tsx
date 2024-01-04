import { memo, useEffect } from 'react';

import type { IInlineComment } from '@growi/core';
import { applyPatch } from 'diff';

import loggerFactory from '~/utils/logger';

import { getElementByXpath } from './utils';

const logger = loggerFactory('growi:components:InlineComment');


const findAnnotatedElem = (firstLevelBlock: Element | undefined): Element | undefined => {
  if (firstLevelBlock == null) {
    return undefined;
  }

  const annotatedElems = firstLevelBlock.getElementsByClassName('annotation-0');
  if (annotatedElems.length === 0) {
    return;
  }
  return annotatedElems[0];
};


const ModalPortal = ({ annotatedElem }) => {
  if (annotatedElem == null) {
    return <></>;
  }

  return <>ModalPortal</>;
};


type Props = {
  inlineComment: IInlineComment;
  wikiElementXpath: string;
}

export const InlineComment = memo((props: Props): JSX.Element => {
  const { inlineComment, wikiElementXpath } = props;
  const { firstLevelBlockXpath, innerHtmlDiff } = inlineComment;

  const firstLevelBlock = getElementByXpath(wikiElementXpath + firstLevelBlockXpath);
  const annotatedElem = findAnnotatedElem(firstLevelBlock);

  useEffect(() => {
    if (firstLevelBlock == null || annotatedElem != null) {
      return;
    }

    // restore annotated html
    const orgInnerHTML = firstLevelBlock.innerHTML;
    const annotated = applyPatch(orgInnerHTML, innerHtmlDiff);

    if (!annotated) {
      logger.warn('apply patch has failed.', {
        xpath: firstLevelBlockXpath,
      });
      return;
    }

    firstLevelBlock.innerHTML = annotated;

  }, [annotatedElem, firstLevelBlock, firstLevelBlockXpath, innerHtmlDiff, wikiElementXpath]);

  return (
    <>
      <ModalPortal annotatedElem={annotatedElem}></ModalPortal>
    </>
  );
});
