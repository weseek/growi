import React from 'react';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IPageHasId } from '~/interfaces/page';


type PageListItemSProps = {
  page: IPageHasId,
  noLink?: boolean,
  pageTitle?: string
}

export const PageListItemS = (props: PageListItemSProps): JSX.Element => {

  const { page, noLink = false, pageTitle } = props;

  const path = pageTitle != null ? pageTitle : page.path;

  let pagePathElement = <PagePathLabel path={path} additionalClassNames={['mx-1']} />;
  if (!noLink) {
    pagePathElement = <a className="text-break" href={page.path}>{pagePathElement}</a>;
  }

  return (
    <>
      <UserPicture user={page.lastUpdateUser} noLink={noLink} />
      {pagePathElement}
      <span className="ml-2">
        <PageListMeta page={page} />
      </span>
    </>
  );

};
