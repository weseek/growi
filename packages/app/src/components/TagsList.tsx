import React, { FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRxTagsList } from '~/stores/tag';

import PaginationWrapper from './PaginationWrapper';
import TagCloudBox from './TagCloudBox';


const PAGING_LIMIT = 10;

type Props = {
  isOnReload: boolean
}

const TagsList: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [activePage, setActivePage] = useState<number>(1);
  const [pagingOffset, setPagingOffset] = useState<number>(0);

  const { data: tagsList, error, mutate } = useSWRxTagsList(PAGING_LIMIT, pagingOffset);

  const handlePage = (selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setPagingOffset((selectedPageNumber - 1) * PAGING_LIMIT);
  };

  useEffect(() => {
    if (props.isOnReload) {
      mutate();
    }
  }, [mutate, props.isOnReload]);

  const isLoading = tagsList === undefined && error == null;
  if (isLoading) {
    return (
      <div className="text-muted text-center">
        <i className="fa fa-2x fa-spinner fa-pulse mt-3"></i>
      </div>
    );
  }

  return (
    <>
      <header className="py-0">
        <h1 className="title text-center mt-5 mb-3 font-weight-bold">{`${t('Tags')}(${tagsList?.totalCount || 0})`}</h1>
      </header>
      <div className="row text-center">
        <div className="col-12 mb-5 px-5">
          <TagCloudBox tags={tagsList?.data || []} minSize={20} />
        </div>
        <div className="col-12 tag-list mb-4">
          <ul className="list-group text-left">
            {
              tagsList?.data != null && tagsList.data.length > 0
                ? tagsList.data.map((tag) => {
                  return (
                    <a key={tag.name} href={`/_search?q=tag:${tag.name}`} className="list-group-item">
                      <i className="icon-tag mr-2"></i>{tag.name}
                      <span className="ml-4 list-tag-count badge badge-secondary text-muted">{tag.count}</span>
                    </a>
                  );
                })
                : <h3>{ t('You have no tag, You can set tags on pages') }</h3>
            }
          </ul>
        </div>
        <div className="col-12 tag-list-pagination">
          <PaginationWrapper
            activePage={activePage}
            changePage={handlePage}
            totalItemsCount={tagsList?.totalCount || 0}
            pagingLimit={PAGING_LIMIT}
            align="center"
            size="md"
          />
        </div>
      </div>
    </>
  );
};

export default TagsList;
