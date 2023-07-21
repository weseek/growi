import React from 'react';

import type { IPageHasId } from '@growi/core/dist/interfaces';
import { PageListMeta } from '@growi/ui/dist/components/PagePath/PageListMeta';
import { PagePathLabel } from '@growi/ui/dist/components/PagePath/PagePathLabel';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import Link from 'next/link';


type PageListItemSProps = {
  page: IPageHasId,
  noLink?: boolean,
  pageTitle?: string,
}

export const PageListItemS = (props: PageListItemSProps): JSX.Element => {

  const {
    page, noLink = false, pageTitle,
  } = props;

  const path = pageTitle != null ? pageTitle : page.path;

  let pagePathElement = <PagePathLabel path={path} additionalClassNames={['mx-1']} />;
  if (!noLink) {
    pagePathElement = <Link href={`/${page._id}`} className="text-break" prefetch={false}>{pagePathElement}</Link>;
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
