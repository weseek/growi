import React from 'react';

import { PageListMeta } from '@growi/ui/dist/components/PagePath/PageListMeta';
import { PagePathLabel } from '@growi/ui/dist/components/PagePath/PagePathLabel';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import Clamp from 'react-multiline-clamp';

import { IPageHasId } from '~/interfaces/page';

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
    pagePathElement = <a className="text-break" href={page.path}>{pagePathElement}</a>;
  }

  return (
    <>
      <UserPicture user={page.lastUpdateUser} noLink={noLink} />
      {isNarrowView ? (
        <Clamp lines={2}>
          <div className={`mx-2 ${styles['page-title']} ${noLink ? 'text-break' : ''}`}>
            { pagePathElement }
          </div>
        </Clamp>
      ) : (
        { pagePathElement }
      )}
      <span className="ml-2">
        <PageListMeta page={page} />
      </span>
    </>
  );

};
