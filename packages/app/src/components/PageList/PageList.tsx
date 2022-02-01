import React from 'react';
import { useTranslation } from 'react-i18next';

import { IPageHasId } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';

import PageListItemS from './PageListItemS';
import PaginationWrapper from '../PaginationWrapper';


type Props = {
  pages: IPagingResult<IPageHasId>,
}

const PageList = (props: Props): JSX.Element => {
  const { t } = useTranslation();
  const { pages } = props;

  if (pages == null) {
    return (
      <div className="wiki">
        <div className="text-muted text-center">
          <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
        </div>
      </div>
    );
  }

  const pageList = pages.items.map(page => (
    <li key={page._id} className={liClassesStr}>
      <PageListItemS page={page} />
    </li>
  ));

  if (pageList.length === 0) {
    return (
      <div className="mt-2">
        <p>{t('custom_navigation.no_page_list')}</p>
      </div>
    );
  }

  return (
    <div className="page-list">
      <ul className="page-list-ul page-list-ul-flat">
        {pageList}
      </ul>
    </div>
  );
};

export default PageList;
