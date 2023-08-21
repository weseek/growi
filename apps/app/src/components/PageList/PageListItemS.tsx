import React from 'react';

import type { IPageHasId } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { PageListMeta, PagePathLabel } from '@growi/ui/dist/components/PagePath';
import Link from 'next/link';
import Clamp from 'react-multiline-clamp';

import styles from './PageListItemS.module.scss';

type PageListItemSProps = {
  page: IPageHasId,
  noLink?: boolean,
  pageTitle?: string
  isNarrowView?: boolean,
}

export const PageListItemS = (props: PageListItemSProps): JSX.Element => {

  const {
    page,
    noLink = false,
    pageTitle,
    isNarrowView = false,
  } = props;

  const path = pageTitle != null ? pageTitle : page.path;

  let pagePathElement = <PagePathLabel path={path} additionalClassNames={['mx-1']} />;
  if (!noLink) {
    pagePathElement = <Link href={`/${page._id}`} className="text-break" prefetch={false}>{pagePathElement}</Link>;
  }

  return (
    <>
      <UserPicture user={page.lastUpdateUser} noLink={noLink} />
      {isNarrowView ? (
        <Clamp lines={2}>
          <div className={`mx-2 ${styles['page-title']} ${noLink ? 'text-break' : ''}`}>
            {pagePathElement}
          </div>
        </Clamp>
      ) : (
        pagePathElement
      )}
      <span className="ml-2">
        <PageListMeta page={page} shouldSpaceOutIcon />
      </span>
    </>
  );

};
