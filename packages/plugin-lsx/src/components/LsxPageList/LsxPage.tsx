import React, { useMemo } from 'react';

import { pathUtils } from '@growi/core';
import { PagePathLabel, PageListMeta } from '@growi/ui';

import { PageNode } from '../PageNode';
import { LsxContext } from '../lsx-context';


type Props = {
  pageNode: PageNode,
  lsxContext: LsxContext,
  depth: number,
  basisViewersCount?: number,
};

export const LsxPage = React.memo((props: Props): JSX.Element => {
  const {
    pageNode, lsxContext, depth, basisViewersCount,
  } = props;

  const isExists = pageNode.page !== undefined;
  const isLinkable = (() => {
    // process depth option
    const optDepth = lsxContext.getOptDepth();
    if (optDepth == null) {
      return true;
    }

    // debug
    // console.log(pageNode.pagePath, {depth, decGens, 'optDepth.start': optDepth.start, 'optDepth.end': optDepth.end});

    return optDepth.start <= depth;
  })();
  const hasChildren = pageNode.children.length > 0;

  const childrenElements: JSX.Element = useMemo(() => {
    let element = <></>;

    // create child pages elements
    if (hasChildren) {
      const pages = pageNode.children.map((pageNode) => {
        return (
          <LsxPage
            key={pageNode.pagePath}
            depth={depth + 1}
            pageNode={pageNode}
            lsxContext={lsxContext}
            basisViewersCount={basisViewersCount}
          />
        );
      });

      element = <ul className="page-list-ul">{pages}</ul>;
    }

    return element;
  }, [basisViewersCount, depth, hasChildren, lsxContext, pageNode.children]);

  const iconElement: JSX.Element = useMemo(() => {
    return (isExists)
      ? <i className="ti ti-agenda" aria-hidden="true"></i>
      : <i className="ti ti-file lsx-page-not-exist" aria-hidden="true"></i>;
  }, [isExists]);

  const pagePathElement: JSX.Element = useMemo(() => {
    const classNames: string[] = [];
    if (!isExists) {
      classNames.push('lsx-page-not-exist');
    }

    // create PagePath element
    let pagePathNode = <PagePathLabel path={pageNode.pagePath} isLatterOnly additionalClassNames={classNames} />;
    if (isLinkable) {
      pagePathNode = <a className="page-list-link" href={encodeURI(pathUtils.removeTrailingSlash(pageNode.pagePath))}>{pagePathNode}</a>;
    }
    return pagePathNode;
  }, [isExists, isLinkable, pageNode.pagePath]);

  const pageListMetaElement: JSX.Element = useMemo(() => {
    if (!isExists) {
      return <></>;
    }
    return <PageListMeta page={pageNode.page} basisViewersCount={basisViewersCount} />;
  }, [basisViewersCount, isExists, pageNode.page]);

  return (
    <li className="page-list-li">
      <small>{iconElement}</small> {pagePathElement}
      <span className="ml-2">{pageListMetaElement}</span>
      {childrenElements}
    </li>
  );

});
