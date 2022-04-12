import React, { FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useSWRxTagsList } from '~/stores/tag';

import { toastError } from '../client/util/apiNotification';

import PaginationWrapper from './PaginationWrapper';
import TagCloudBox from './TagCloudBox';


type Props = {
  isOnReload: boolean
}

const TagsList: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const [activePage, setActivePage] = useState(1);
  const [totalTags, setTotalTags] = useState(0);
  const [pagingLimit, setPagingLimit] = useState(10);
  const [pagingOffset, setPagingOffset] = useState(0);

  const { data: tagsListResult, mutate } = useSWRxTagsList(pagingLimit, pagingOffset);

  const handlePage = (selectedPageNumber: number) => {
    setActivePage(selectedPageNumber);
    setPagingOffset((selectedPageNumber - 1) * pagingLimit);
  };

  useEffect(() => {
    mutate();
  }, [mutate, props.isOnReload]);

  return (
    <>
      <header className="py-0">
        <h1 className="title text-center mt-5 mb-3 font-weight-bold">{`${t('Tags')}(${tagsListResult?.totalCount || 0})`}</h1>
      </header>
      <div className="row text-center">
        <div className="col-12 mb-5 px-5">
          <TagCloudBox tags={tagsListResult?.data || []} minSize={20} />
        </div>
        <div className="col-12 tag-list mb-4">
          <ul className="list-group text-left">
            {
              tagsListResult?.data != null && tagsListResult.data.length > 0
                ? tagsListResult.data.map((tag) => {
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
            totalItemsCount={tagsListResult?.totalCount || 0}
            pagingLimit={pagingLimit}
            align="center"
            size="md"
          />
        </div>
      </div>
    </>
  );
};

export default TagsList;
