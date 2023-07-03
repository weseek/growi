import React from 'react';

import { PageListMeta } from '@growi/ui/dist/components/PagePath/PageListMeta';
import { PagePathLabel } from '@growi/ui/dist/components/PagePath/PagePathLabel';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';

import { IPageHasId } from '~/interfaces/page';

import styles from './PageList.module.scss';


type PageListItemSProps = {
  page: IPageHasId,
  noLink?: boolean,
  pageTitle?: string
}

export const PageListItemS = (props: PageListItemSProps): JSX.Element => {

  const { page, noLink = false, pageTitle } = props;

  const path = pageTitle != null ? pageTitle : page.path;

  let pagePathElement = <PagePathLabel path={path} additionalClassNames={['mx-0']} />;
  if (!noLink) {
    pagePathElement = <a className="text-break" href={page.path}>{pagePathElement}</a>;
  }

  return (
    <>
      <UserPicture user={page.lastUpdateUser} noLink={noLink} />
      <div className={`${styles['page-list']}`}>
        <div
          className="mx-2 path-element"
        >
          {pagePathElement}
        </div>
      </div>
      <span className="ml-2">
        <PageListMeta page={page} />
      </span>
    </>
  );

};
