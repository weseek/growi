import { useEffect, useMemo, useState } from 'react';

import type { IInlineComment } from '@growi/core';
import { applyPatch } from 'diff';
import { createPortal } from 'react-dom';

import loggerFactory from '~/utils/logger';

import { getElementByXpath } from './utils';

const logger = loggerFactory('growi:components:InlineComment');


const ModalPortal = ({ firstLevelBlock, children }) => {
  if (firstLevelBlock == null) {
    console.log('parent is null');
    return <></>;
  }

  const annotatedElems = firstLevelBlock.getElementsByClassName('annotation-0');
  if (annotatedElems.length !== 1) {
    return <></>;
  }

  return createPortal(children, annotatedElems[0]);
};


type Props = {
  inlineComment: IInlineComment;
  wikiElementXpath: string;
}

export const InlineComment = (props: Props): JSX.Element => {
  const { inlineComment, wikiElementXpath } = props;
  const { firstLevelBlockXpath, innerHtmlDiff } = inlineComment;

  const [showPortal, setShowPortal] = useState(false);

  const firstLevelBlock = getElementByXpath(wikiElementXpath + firstLevelBlockXpath);

  useEffect(() => {
    if (firstLevelBlock == null || showPortal) {
      return;
    }

    // restore annotated html
    const orgInnerHTML = firstLevelBlock.innerHTML;
    const annotated = applyPatch(orgInnerHTML, innerHtmlDiff);

    if (!annotated) {
      logger.debug('apply patch has failed.', {
        xpath: firstLevelBlockXpath,
      });
      return;
    }

    firstLevelBlock.innerHTML = annotated;

    setShowPortal(true);
    console.log('set showPotal true');

  }, [firstLevelBlock, firstLevelBlockXpath, innerHtmlDiff, showPortal, wikiElementXpath]);

  console.log({ showPortal });
  return (
    <>
      { showPortal && <ModalPortal firstLevelBlock={firstLevelBlock}>foobar</ModalPortal> }
    </>
  );
};
