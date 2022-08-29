import React from 'react';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IPageHasId } from '~/interfaces/page';


type PageListItemSProps = {
  page: IPageHasId,
  noLink?: boolean,
}

export const PageListItemS = (props: PageListItemSProps): JSX.Element => {

  const { page, noLink = false } = props;

  let pagePathElement = <PagePathLabel path={page.path} additionalClassNames={['mx-1']} />;
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
