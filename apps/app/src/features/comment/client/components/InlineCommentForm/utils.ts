import type { IInlineCommentAttributes } from '@growi/core';
import { createPatch } from 'diff';
import getXPath from 'get-xpath';
import TextAnnotator from 'text-annotator-v2';

import type { TextAnnotatorInterface } from '../../@types/text-annotator-v2';

const retrieveFirstLevelNode = (target: Node, root: Element): Node | null => {
  if (target === root || target.parentElement == null) {
    return null;
  }
  if (target.parentElement === root) {
    return target;
  }

  return retrieveFirstLevelNode(target.parentElement, root);
};

const getRelativeXpath = (target: Element, from: Element): string => {
  const fromXpath = getXPath(from);
  const xpath = getXPath(target);

  if (!xpath.startsWith(fromXpath)) {
    throw new Error("This target element is not one of descendants of the 'from' element.");
  }

  return xpath.slice(fromXpath.length);
};


export const generateInlineCommentAttributes = (range: Range, rootElement: Element): IInlineCommentAttributes => {
  const firstLevelNode = retrieveFirstLevelNode(range.commonAncestorContainer, rootElement);

  if (firstLevelNode == null || !(firstLevelNode instanceof Element)) {
    throw new Error('The firstLevelNode is null.');
  }
  if (!(firstLevelNode instanceof Element)) {
    throw new Error('The firstLevelNode is not an element.');
  }

  const firstLevelElement = firstLevelNode;

  const annotator: TextAnnotatorInterface = new TextAnnotator(firstLevelElement.innerHTML);
  const annotationIndex = annotator.search(range.toString());

  if (annotationIndex < 0) {
    throw new Error('Could not find annotation index for the range.');
  }

  const firstLevelBlockXpath = getRelativeXpath(firstLevelElement, rootElement);
  const annotated = annotator.annotate(annotationIndex);
  const innerHtmlDiff = createPatch(
    firstLevelBlockXpath,
    firstLevelElement.innerHTML, annotated,
  );

  return {
    firstLevelBlockXpath,
    innerHtmlDiff,
  };
};
