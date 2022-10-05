import React, { memo } from 'react';

import Link from 'next/link';
import urljoin from 'url-join';

import LinkedPagePath from '../models/linked-page-path';


type PagePathHierarchicalLinkProps = {
  linkedPagePath: LinkedPagePath,
  linkedPagePathByHtml?: LinkedPagePath,
  basePath?: string,
  isInTrash?: boolean,

  // !!INTERNAL USE ONLY!!
  isInnerElem?: boolean,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const PagePathHierarchicalLink = memo((props: PagePathHierarchicalLinkProps): JSX.Element => {
  const {
    linkedPagePath, linkedPagePathByHtml, basePath, isInTrash,
  } = props;

  // render root element
  if (linkedPagePath.isRoot) {
    if (basePath != null) {
      return <></>;
    }

    return isInTrash
      ? (
        <>
          <span className="path-segment">
            <Link href="/trash" prefetch={false}>
              <a ><i className="icon-trash"></i></a>
            </Link>
          </span>
          <span className="separator"><a href="/">/</a></span>
        </>
      )
      : (
        <>
          <span className="path-segment">
            <Link href="/" prefetch={false}>
              <a >
                <i className="icon-home"></i>
                <span className="separator">/</span>
              </a>
            </Link>
          </span>
        </>
      );
  }

  const isParentExists = linkedPagePath.parent != null;
  const isParentRoot = linkedPagePath.parent?.isRoot;
  const isSeparatorRequired = isParentExists && !isParentRoot;

  const shouldDangerouslySetInnerHTML = linkedPagePathByHtml != null;

  const href = encodeURI(urljoin(basePath || '/', linkedPagePath.href));

  // eslint-disable-next-line react/prop-types
  const RootElm = ({ children }) => {
    return props.isInnerElem
      ? <>{children}</>
      : <span className="grw-page-path-hierarchical-link text-break">{children}</span>;
  };

  return (
    <RootElm>
      { isParentExists && (
        <PagePathHierarchicalLink
          linkedPagePath={linkedPagePath.parent}
          linkedPagePathByHtml={linkedPagePathByHtml?.parent}
          basePath={basePath}
          isInTrash={isInTrash || linkedPagePath.isInTrash}
          isInnerElem
        />
      ) }
      { isSeparatorRequired && (
        <span className="separator">/</span>
      ) }

      <Link href={href} prefetch={false}>
        {
          shouldDangerouslySetInnerHTML
            // eslint-disable-next-line react/no-danger
            ? <a className="page-segment" dangerouslySetInnerHTML={{ __html: linkedPagePathByHtml.pathName }}></a>
            : <a className="page-segment" >{linkedPagePath.pathName}</a>
        }
      </Link>

    </RootElm>
  );
});
PagePathHierarchicalLink.displayName = 'PagePathHierarchicalLink';


export default PagePathHierarchicalLink;
